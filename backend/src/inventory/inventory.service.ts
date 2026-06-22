import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CartItem } from '../common/types';

@Injectable()
export class InventoryService {
  private logger = new Logger('InventoryService');

  constructor(private prisma: PrismaService) {}

  async validateStockAvailable(items: CartItem[]): Promise<void> {
    const inventories = await this.prisma.inventory.findMany({
      where: {
        OR: items.map(item => ({
          productId: item.productId,
          size: item.size,
          color: item.color,
        })),
      },
    });

    const inventoryMap = new Map(inventories.map(inv =>
      [`${inv.productId}|${inv.size}|${inv.color}`, inv]
    ));

    for (const item of items) {
      const inventory = inventoryMap.get(`${item.productId}|${item.size}|${item.color}`);
      if (!inventory || inventory.quantity < item.quantity) {
        throw new BadRequestException(
          `Sản phẩm không đủ số lượng trong kho. Yêu cầu: ${item.quantity}, Có sẵn: ${inventory?.quantity || 0}`,
        );
      }
    }
  }

  async reserveStock(items: CartItem[], tx?: Prisma.TransactionClient) {
    const client = tx || this.prisma;

    const inventories = await client.inventory.findMany({
      where: {
        OR: items.map(item => ({
          productId: item.productId,
          size: item.size,
          color: item.color,
        })),
      },
    });

    const inventoryMap = new Map(inventories.map(inv =>
      [`${inv.productId}|${inv.size}|${inv.color}`, inv]
    ));

    for (const item of items) {
      const inventory = inventoryMap.get(`${item.productId}|${item.size}|${item.color}`);
      if (!inventory) {
        throw new BadRequestException(`Sản phẩm không tồn tại: ${item.productId}`);
      }
      if (inventory.quantity < item.quantity) {
        throw new BadRequestException(
          `Không đủ số lượng: ${item.productId}. Yêu cầu: ${item.quantity}, Có sẵn: ${inventory.quantity}`,
        );
      }
    }

    await Promise.all(
      items.map(item => {
        const inventory = inventoryMap.get(`${item.productId}|${item.size}|${item.color}`)!;
        this.logger.debug(
          `Reserved ${item.quantity} units of ${item.productId} (size: ${item.size}, color: ${item.color})`,
        );
        return client.inventory.update({
          where: { id: inventory.id },
          data: { quantity: { decrement: item.quantity } },
        });
      })
    );
  }

  async releaseStock(items: CartItem[], tx?: Prisma.TransactionClient) {
    const client = tx || this.prisma;

    const inventories = await client.inventory.findMany({
      where: {
        OR: items.map(item => ({
          productId: item.productId,
          size: item.size,
          color: item.color,
        })),
      },
    });

    const inventoryMap = new Map(inventories.map(inv =>
      [`${inv.productId}|${inv.size}|${inv.color}`, inv]
    ));

    await Promise.all(
      items.map(item => {
        const inventory = inventoryMap.get(`${item.productId}|${item.size}|${item.color}`);
        if (!inventory) {
          this.logger.warn(
            `Inventory not found for ${item.productId} (size: ${item.size}, color: ${item.color})`,
          );
          return Promise.resolve();
        }
        this.logger.debug(`Released ${item.quantity} units of ${item.productId}`);
        return client.inventory.update({
          where: { id: inventory.id },
          data: { quantity: { increment: item.quantity } },
        });
      })
    );
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
      include: { product: { select: { id: true, name: true, slug: true } } },
    });
  }

  async adjustQuantity(id: string, adjustment: number, reason = 'Manual adjustment') {
    if (!Number.isInteger(adjustment)) {
      throw new BadRequestException('Adjustment must be an integer');
    }

    const inventory = await this.prisma.inventory.findUnique({ where: { id } });
    if (!inventory) {
      throw new BadRequestException('Inventory not found');
    }

    const newQuantity = inventory.quantity + adjustment;
    if (newQuantity < 0) {
      throw new BadRequestException(
        `Cannot reduce quantity by ${adjustment}. Current: ${inventory.quantity}, New would be: ${newQuantity}`
      );
    }

    this.logger.log(`Adjusted inventory ${id} by ${adjustment} (${reason}). ${inventory.quantity} → ${newQuantity}`);

    return this.prisma.inventory.update({
      where: { id },
      data: { quantity: newQuantity },
      include: { product: { select: { id: true, name: true, slug: true } } },
    });
  }
}
