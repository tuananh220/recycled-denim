import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus, PaymentProvider, PaymentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CheckoutDto, UpdateOrderStatusDto } from './dto/order.dto';
import { MailService } from '../mail/mail.service';

const ord = (n: number) => n.toString().padStart(5, '0');

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private mail: MailService,
  ) {}

  async checkout(userId: string, dto: CheckoutDto) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: { include: { images: { take: 1 } } } } } },
    });
    if (!cart || cart.items.length === 0) throw new BadRequestException('Cart is empty');

    let subtotal = 0;
    const items: Prisma.OrderItemCreateWithoutOrderInput[] = cart.items.map(i => {
      const unit = Number(i.product.price);
      subtotal += unit * i.quantity;
      return {
        product: { connect: { id: i.productId } },
        name: i.product.name,
        imageUrl: i.product.images[0]?.url ?? null,
        size: i.size, color: i.color,
        quantity: i.quantity, unitPrice: unit,
      };
    });

    // coupon
    let discount = 0;
    if (dto.couponCode) {
      const coupon = await this.prisma.coupon.findUnique({ where: { code: dto.couponCode } });
      if (coupon && coupon.isActive && (!coupon.expiresAt || coupon.expiresAt > new Date())) {
        discount = coupon.type === 'PERCENT'
          ? (subtotal * Number(coupon.value)) / 100
          : Number(coupon.value);
        await this.prisma.coupon.update({ where: { id: coupon.id }, data: { uses: { increment: 1 } } });
      }
    }

    const shipping = subtotal > 200 ? 0 : 12;
    const tax = +(subtotal * 0.08).toFixed(2);
    const total = +(subtotal + shipping + tax - discount).toFixed(2);
    const count = await this.prisma.order.count();
    const number = `INDG-${ord(count + 1)}`;

    const order = await this.prisma.order.create({
      data: {
        number, userId,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        subtotal, shipping, tax, discount, total,
        couponCode: dto.couponCode ?? null,
        notes: dto.notes ?? null,
        shippingAddress: dto.shippingAddress,
        items: { create: items },
        payments: { create: { provider: dto.paymentProvider ?? PaymentProvider.COD, amount: total, status: PaymentStatus.PENDING } },
      },
      include: { items: true, payments: true, user: true },
    });
    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    // Send order confirmation email for COD orders
    const appliedProvider = dto.paymentProvider ?? PaymentProvider.COD;
    if (appliedProvider === PaymentProvider.COD) {
      this.mail.sendOrderConfirmation(order.user.email, order).catch(err => {
        console.error('Failed to send order confirmation email:', err);
      });
    }

    return order;
  }

  myOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId }, orderBy: { createdAt: 'desc' },
      include: { items: true },
    });
  }

  async getOne(userId: string, id: string, asAdmin = false) {
    const order = await this.prisma.order.findUnique({
      where: { id }, include: { items: true, payments: true, user: true },
    });
    if (!order) throw new NotFoundException();
    if (!asAdmin && order.userId !== userId) throw new NotFoundException();
    return order;
  }

  listAll(page = 1, pageSize = 20) {
    return this.prisma.$transaction([
      this.prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize, take: pageSize,
        include: { user: { select: { id: true, email: true, name: true } }, items: true },
      }),
      this.prisma.order.count(),
    ]).then(([data, total]) => ({ data, meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } }));
  }

  updateStatus(id: string, dto: UpdateOrderStatusDto) {
    return this.prisma.order.update({
      where: { id },
      data: { status: dto.status, trackingNumber: dto.trackingNumber ?? undefined },
    });
  }

  async cancel(userId: string, id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });
    if (!order) throw new NotFoundException('Đơn hàng không tồn tại');
    if (order.userId !== userId) throw new BadRequestException('Bạn không có quyền hủy đơn hàng này');
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Chỉ có thể hủy đơn hàng khi trạng thái là Chờ xác nhận (PENDING)');
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: {
        status: OrderStatus.CANCELLED,
        paymentStatus: PaymentStatus.FAILED,
      },
      include: { items: true, payments: true, user: true },
    });

    // Send order cancellation email
    this.mail.sendOrderCancellation(updatedOrder.user.email, updatedOrder).catch(err => {
      console.error('Failed to send order cancellation email:', err);
    });

    return updatedOrder;
  }
}
