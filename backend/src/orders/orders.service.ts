import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus, PaymentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CheckoutDto, UpdateOrderStatusDto } from './dto/order.dto';

const ord = (n: number) => n.toString().padStart(5, '0');

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

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
        payments: { create: { provider: dto.paymentProvider, amount: total, status: PaymentStatus.PENDING } },
      },
      include: { items: true, payments: true },
    });
    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
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
}
