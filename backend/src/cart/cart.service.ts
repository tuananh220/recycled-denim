import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  private async ensure(userId: string) {
    return this.prisma.cart.upsert({ where: { userId }, update: {}, create: { userId } });
  }

  async get(userId: string) {
    const cart = await this.ensure(userId);
    return this.prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            product: { include: { images: { orderBy: { position: 'asc' }, take: 1 } } },
          },
        },
      },
    });
  }

  async addItem(userId: string, dto: { productId: string; size: string; color: string; quantity?: number }) {
    const cart = await this.ensure(userId);
    return this.prisma.cartItem.upsert({
      where: {
        cartId_productId_size_color: {
          cartId: cart.id, productId: dto.productId, size: dto.size, color: dto.color,
        },
      },
      update: { quantity: { increment: dto.quantity ?? 1 } },
      create: { cartId: cart.id, productId: dto.productId, size: dto.size, color: dto.color, quantity: dto.quantity ?? 1 },
    });
  }

  async updateItem(userId: string, itemId: string, quantity: number) {
    const cart = await this.ensure(userId);
    const item = await this.prisma.cartItem.findFirst({ where: { id: itemId, cartId: cart.id } });
    if (!item) throw new NotFoundException();
    if (quantity <= 0) return this.prisma.cartItem.delete({ where: { id: itemId } });
    return this.prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
  }

  async removeItem(userId: string, itemId: string) {
    const cart = await this.ensure(userId);
    const item = await this.prisma.cartItem.findFirst({ where: { id: itemId, cartId: cart.id } });
    if (!item) throw new NotFoundException();
    return this.prisma.cartItem.delete({ where: { id: itemId } });
  }

  async clear(userId: string) {
    const cart = await this.ensure(userId);
    return this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  }
}
