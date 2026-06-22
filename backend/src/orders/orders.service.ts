import { BadRequestException, Injectable, NotFoundException, Logger } from '@nestjs/common';
import { OrderStatus, PaymentProvider, PaymentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { InventoryService } from '../inventory/inventory.service';
import { CheckoutDto, UpdateOrderStatusDto } from './dto/order.dto';
import { MailService } from '../mail/mail.service';

const ord = (n: number) => n.toString().padStart(5, '0');

interface CartItem {
  productId: string;
  size?: string;
  color?: string;
  quantity: number;
}

@Injectable()
export class OrdersService {
  private logger = new Logger('OrdersService');

  constructor(
    private prisma: PrismaService,
    private mail: MailService,
    private inventory: InventoryService,
  ) {}

  async checkout(userId: string, dto: CheckoutDto) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: { include: { images: { take: 1 } } } } } },
    });
    if (!cart || cart.items.length === 0) throw new BadRequestException('Giỏ hàng trống');

    // Prepare cart items for inventory check
    const cartItemsForInventory: CartItem[] = cart.items.map(i => ({
      productId: i.productId,
      size: i.size,
      color: i.color,
      quantity: i.quantity,
    }));

    // 1. VALIDATE STOCK AVAILABILITY
    await this.inventory.validateStockAvailable(cartItemsForInventory);

    // 2. CALCULATE TOTALS
    let subtotal = 0;
    const items: Prisma.OrderItemCreateWithoutOrderInput[] = cart.items.map(i => {
      const unit = Number(i.product.price);
      subtotal += unit * i.quantity;
      return {
        product: { connect: { id: i.productId } },
        name: i.product.name,
        imageUrl: i.product.images[0]?.url ?? null,
        size: i.size,
        color: i.color,
        quantity: i.quantity,
        unitPrice: unit,
      };
    });

    // 3. VALIDATE & APPLY COUPON (enhanced validation)
    let discount = 0;
    let coupon = null;
    if (dto.couponCode) {
      coupon = await this.prisma.coupon.findUnique({
        where: { code: dto.couponCode },
      });

      if (!coupon) {
        throw new BadRequestException('Mã giảm giá không hợp lệ');
      }
      if (!coupon.isActive) {
        throw new BadRequestException('Mã giảm giá không còn hoạt động');
      }
      if (coupon.expiresAt && coupon.expiresAt < new Date()) {
        throw new BadRequestException('Mã giảm giá đã hết hạn');
      }
      // NEW: Check maxUses
      if (coupon.maxUses && coupon.uses >= coupon.maxUses) {
        throw new BadRequestException('Mã giảm giá đã hết lượt sử dụng');
      }
      // NEW: Check minOrderTotal
      if (coupon.minOrderTotal && subtotal < Number(coupon.minOrderTotal)) {
        throw new BadRequestException(
          `Đơn hàng phải tối thiểu ${coupon.minOrderTotal} VNĐ để sử dụng mã này`,
        );
      }

      discount = coupon.type === 'PERCENT'
        ? (subtotal * Number(coupon.value)) / 100
        : Number(coupon.value);
    }

    const shipping = subtotal > 200 ? 0 : 12;
    const tax = +(subtotal * 0.08).toFixed(2);
    const total = +(subtotal + shipping + tax - discount).toFixed(2);

    // 4. CREATE ORDER WITH TRANSACTION (ATOMIC OPERATION)
    try {
      const order = await this.prisma.$transaction(async (tx) => {
        // Get next order number
        const count = await tx.order.count();
        const number = `INDG-${ord(count + 1)}`;

        // Create order
        const newOrder = await tx.order.create({
          data: {
            number,
            userId,
            status: OrderStatus.PENDING,
            paymentStatus: PaymentStatus.PENDING,
            subtotal,
            shipping,
            tax,
            discount,
            total,
            couponCode: dto.couponCode ?? null,
            notes: dto.notes ?? null,
            shippingAddress: dto.shippingAddress,
            items: { create: items },
            payments: {
              create: {
                provider: dto.paymentProvider ?? PaymentProvider.COD,
                amount: total,
                status: PaymentStatus.PENDING,
              },
            },
          },
          include: { items: true, payments: true, user: true, history: true },
        });

        // Reserve inventory
        await this.inventory.reserveStock(cartItemsForInventory, tx);

        // Increment coupon uses
        if (coupon) {
          await tx.coupon.update({
            where: { id: coupon.id },
            data: { uses: { increment: 1 } },
          });
        }

        // Record order history
        await tx.orderHistory.create({
          data: {
            orderId: newOrder.id,
            oldStatus: null, // First entry
            newStatus: OrderStatus.PENDING,
            changedBy: userId,
            reason: 'Order created via checkout',
          },
        });

        // Clear cart (only after everything succeeds)
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

        return newOrder;
      });

      // 5. SEND EMAIL (after successful transaction)
      const appliedProvider = dto.paymentProvider ?? PaymentProvider.COD;
      if (appliedProvider === PaymentProvider.COD) {
        this.mail
          .sendOrderConfirmation(order.user.email, order)
          .catch(err => {
            this.logger.error('Failed to send order confirmation email:', err);
          });
      }

      this.logger.log(`Order created: ${order.number} by user ${userId}`);
      return order;
    } catch (error) {
      this.logger.error(
        `Checkout failed for user ${userId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  myOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { items: true, history: true },
    });
  }

  async getOne(userId: string, id: string, asAdmin = false) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true, payments: true, user: true, history: true },
    });
    if (!order) throw new NotFoundException('Đơn hàng không tồn tại');
    if (!asAdmin && order.userId !== userId) {
      throw new BadRequestException('Bạn không có quyền xem đơn hàng này');
    }
    return order;
  }

  listAll(page = 1, pageSize = 20) {
    return this.prisma.$transaction([
      this.prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          user: { select: { id: true, email: true, name: true } },
          items: true,
          history: true,
        },
      }),
      this.prisma.order.count(),
    ]).then(([data, total]) => ({
      data,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    }));
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true, user: true },
    });
    if (!order) throw new NotFoundException('Đơn hàng không tồn tại');

    // Validate status transition
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.PAID]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [],
      [OrderStatus.CANCELLED]: [],
      [OrderStatus.REFUNDED]: [],
    };

    if (!validTransitions[order.status]?.includes(dto.status)) {
      throw new BadRequestException(
        `Không thể chuyển từ ${order.status} sang ${dto.status}`,
      );
    }

    // Update in transaction
    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.order.update({
        where: { id },
        data: {
          status: dto.status,
          trackingNumber: dto.trackingNumber ?? undefined,
        },
        include: { items: true, user: true },
      });

      // Record in history
      await tx.orderHistory.create({
        data: {
          orderId: id,
          oldStatus: order.status,
          newStatus: dto.status,
          changedBy: userId,
          reason: dto.reason ?? 'Status updated by admin',
        },
      });

      return result;
    });

    // Send notification email based on new status
    this.sendStatusChangeEmail(updated, dto.status).catch(err => {
      this.logger.error('Failed to send status change email:', err);
    });

    this.logger.log(
      `Order ${order.number} status updated to ${dto.status} by ${userId}`,
    );
    return updated;
  }

  async cancel(userId: string, id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true, payments: true, user: true },
    });
    if (!order) throw new NotFoundException('Đơn hàng không tồn tại');
    if (order.userId !== userId) {
      throw new BadRequestException('Bạn không có quyền hủy đơn hàng này');
    }
    if (![OrderStatus.PENDING, OrderStatus.PROCESSING].includes(order.status)) {
      throw new BadRequestException(
        'Chỉ có thể hủy đơn hàng ở trạng thái Chờ xác nhận hoặc Đang xử lý',
      );
    }

    // Cancel with transaction (release inventory, decrement coupon)
    const cancelledOrder = await this.prisma.$transaction(async (tx) => {
      // Update order
      const result = await tx.order.update({
        where: { id },
        data: {
          status: OrderStatus.CANCELLED,
          paymentStatus: PaymentStatus.FAILED,
        },
        include: { items: true, payments: true, user: true },
      });

      // Release inventory
      const itemsForRelease: CartItem[] = result.items.map(i => ({
        productId: i.productId,
        size: i.size,
        color: i.color,
        quantity: i.quantity,
      }));
      await this.inventory.releaseStock(itemsForRelease, tx);

      // Decrement coupon uses if used
      if (result.couponCode) {
        await tx.coupon.update({
          where: { code: result.couponCode },
          data: { uses: { decrement: 1 } },
        });
      }

      // Record in history
      await tx.orderHistory.create({
        data: {
          orderId: id,
          oldStatus: order.status,
          newStatus: OrderStatus.CANCELLED,
          changedBy: userId,
          reason: 'Cancelled by customer',
        },
      });

      return result;
    });

    // Send cancellation email
    this.mail
      .sendOrderCancellation(cancelledOrder.user.email, cancelledOrder)
      .catch(err => {
        this.logger.error('Failed to send cancellation email:', err);
      });

    this.logger.log(`Order ${order.number} cancelled by ${userId}`);
    return cancelledOrder;
  }

  private async sendStatusChangeEmail(order: any, status: OrderStatus) {
    switch (status) {
      case OrderStatus.PROCESSING:
        await this.mail.sendOrderConfirmed(order.user.email, order);
        break;
      case OrderStatus.SHIPPED:
        if (order.trackingNumber) {
          await this.mail.sendOrderShipped(
            order.user.email,
            order,
            order.trackingNumber,
          );
        }
        break;
      case OrderStatus.DELIVERED:
        await this.mail.sendOrderDelivered(order.user.email, order);
        break;
      case OrderStatus.REFUNDED:
        await this.mail.sendOrderRefund(order.user.email, order);
        break;
    }
  }
}
