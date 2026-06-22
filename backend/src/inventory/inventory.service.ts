import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

interface CartItem {
  productId: string;
  size?: string;
  color?: string;
  quantity: number;
}

@Injectable()
export class InventoryService {
  private logger = new Logger('InventoryService');

  constructor(private prisma: PrismaService) {}

  async validateStockAvailable(items: CartItem[]): Promise<void> {
    for (const item of items) {
      const inventory = await this.prisma.inventory.findFirst({
        where: {
          productId: item.productId,
          size: item.size,
          color: item.color,
        },
      });

      if (!inventory || inventory.quantity < item.quantity) {
        throw new BadRequestException(
          `Sản phẩm không đủ số lượng trong kho. Yêu cầu: ${item.quantity}, Có sẵn: ${inventory?.quantity || 0}`,
        );
      }
    }
  }

  async reserveStock(items: CartItem[], tx?: Prisma.TransactionClient) {
    const client = tx || this.prisma;

    for (const item of items) {
      const inventory = await client.inventory.findFirst({
        where: {
          productId: item.productId,
          size: item.size,
          color: item.color,
        },
      });

      if (!inventory) {
        throw new BadRequestException(
          `Sản phẩm không tồn tại: ${item.productId}`,
        );
      }

      if (inventory.quantity < item.quantity) {
        throw new BadRequestException(
          `Không đủ số lượng: ${item.productId}. Yêu cầu: ${item.quantity}, Có sẵn: ${inventory.quantity}`,
        );
      }

      // Decrement inventory
      await client.inventory.update({
        where: { id: inventory.id },
        data: { quantity: { decrement: item.quantity } },
      });

      this.logger.debug(
        `Reserved ${item.quantity} units of ${item.productId} (size: ${item.size}, color: ${item.color})`,
      );
    }
  }

  async releaseStock(items: CartItem[], tx?: Prisma.TransactionClient) {
    const client = tx || this.prisma;

    for (const item of items) {
      const inventory = await client.inventory.findFirst({
        where: {
          productId: item.productId,
          size: item.size,
          color: item.color,
        },
      });

      if (!inventory) {
        this.logger.warn(
          `Inventory not found for ${item.productId} (size: ${item.size}, color: ${item.color})`,
        );
        continue;
      }

      // Increment inventory (release)
      await client.inventory.update({
        where: { id: inventory.id },
        data: { quantity: { increment: item.quantity } },
      });

      this.logger.debug(
        `Released ${item.quantity} units of ${item.productId}`,
      );
    }
  }

  async getAvailability(productId: string, size?: string, color?: string) {
    const inventory = await this.prisma.inventory.findFirst({
      where: {
        productId,
        size,
        color,
      },
    });

    return {
      available: inventory?.quantity ?? 0,
      reserved: 0, // Could calculate from pending orders if needed
      total: inventory?.quantity ?? 0,
    };
  }

  async getAll() {
    return this.prisma.inventory.findMany({
      include: { product: { select: { id: true, name: true, slug: true } } },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getByProduct(productId: string) {
    return this.prisma.inventory.findMany({
      where: { productId },
    });
  }

  async updateQuantity(id: string, quantity: number) {
    if (quantity < 0) {
      throw new BadRequestException('Số lượng không thể âm');
    }
    return this.prisma.inventory.update({
      where: { id },
      data: { quantity },
    });
  }
}
