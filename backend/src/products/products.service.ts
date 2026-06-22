import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, QueryProductDto, UpdateProductDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async list(q: QueryProductDto) {
    const page = q.page ?? 1;
    const pageSize = q.pageSize ?? 12;

    const where: Prisma.ProductWhereInput = { isActive: true };
    if (q.q) where.OR = [
      { name: { contains: q.q, mode: 'insensitive' } },
      { description: { contains: q.q, mode: 'insensitive' } },
    ];
    if (q.category) where.category = { slug: q.category };
    if (q.size) where.sizes = { has: q.size };
    if (q.color) where.colors = { has: q.color };
    if (q.minPrice || q.maxPrice) {
      where.price = {};
      if (q.minPrice) (where.price as any).gte = q.minPrice;
      if (q.maxPrice) (where.price as any).lte = q.maxPrice;
    }

    const orderBy: Prisma.ProductOrderByWithRelationInput =
      q.sort === 'price_asc'  ? { price: 'asc' }  :
      q.sort === 'price_desc' ? { price: 'desc' } :
                                { createdAt: 'desc' };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where, orderBy, skip: (page - 1) * pageSize, take: pageSize,
        include: { images: { orderBy: { position: 'asc' } }, category: true },
      }),
      this.prisma.product.count({ where }),
    ]);
    return { data, meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
  }

  /** Admin list — includes inactive too. */
  async listAdmin(q: QueryProductDto) {
    const page = q.page ?? 1;
    const pageSize = q.pageSize ?? 20;
    const where: Prisma.ProductWhereInput = {};
    if (q.q) where.OR = [
      { name: { contains: q.q, mode: 'insensitive' } },
      { slug: { contains: q.q, mode: 'insensitive' } },
    ];
    const [data, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where, orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize, take: pageSize,
        include: { images: { orderBy: { position: 'asc' }, take: 1 }, category: true },
      }),
      this.prisma.product.count({ where }),
    ]);
    return { data, meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
  }

  async getBySlug(slug: string) {
    const p = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        images: { orderBy: { position: 'asc' } },
        category: true,
        reviews: { include: { user: { select: { id: true, name: true, avatarUrl: true } } }, orderBy: { createdAt: 'desc' } },
        inventory: true,
      },
    });
    if (!p) throw new NotFoundException('Product not found');
    return p;
  }

  async getById(id: string) {
    const p = await this.prisma.product.findUnique({
      where: { id },
      include: { images: { orderBy: { position: 'asc' } }, category: true, inventory: true },
    });
    if (!p) throw new NotFoundException('Product not found');
    return p;
  }

  async related(slug: string) {
    const product = await this.prisma.product.findUnique({ where: { slug } });
    if (!product) return [];
    return this.prisma.product.findMany({
      where: { categoryId: product.categoryId, id: { not: product.id }, isActive: true },
      take: 4, include: { images: { orderBy: { position: 'asc' }, take: 1 } },
    });
  }

  async create(dto: CreateProductDto) {
    const product = await this.prisma.product.create({
      data: {
        name: dto.name, slug: dto.slug, description: dto.description,
        price: dto.price, compareAtPrice: dto.compareAtPrice ?? null,
        sizes: dto.sizes, colors: dto.colors,
        recycledPercent: dto.recycledPercent ?? 80,
        isFeatured: dto.isFeatured ?? false,
        categoryId: dto.categoryId,
        isActive: dto.isActive ?? true,
        images: dto.imageUrls?.length ? {
          create: dto.imageUrls.map((url, i) => ({ url, position: i }))
        } : undefined,
      },
      include: { images: true, category: true },
    });

    // Batch create inventory for all size/color combinations
    const qty = dto.initialInventoryQty ?? 0;
    const inventoryItems: Prisma.InventoryCreateManyInput[] = [];
    for (const size of dto.sizes) {
      for (const color of dto.colors) {
        inventoryItems.push({
          productId: product.id,
          size,
          color,
          quantity: qty,
          sku: `${dto.slug}-${size}-${color.replace('#', '')}`.toUpperCase(),
        });
      }
    }
    if (inventoryItems.length > 0) {
      await this.prisma.inventory.createMany({ data: inventoryItems });
    }

    return product;
  }

  async update(id: string, dto: UpdateProductDto & { imageUrls?: string[] }) {
    const { imageUrls, ...rest } = dto;
    if (imageUrls) {
      // Replace all images
      await this.prisma.productImage.deleteMany({ where: { productId: id } });
      await this.prisma.productImage.createMany({
        data: imageUrls.map((url, i) => ({ productId: id, url, position: i })),
      });
    }
    return this.prisma.product.update({
      where: { id },
      data: rest as any,
      include: { images: true, category: true },
    });
  }

  remove(id: string) {
    return this.prisma.product.update({
      where: { id },
      data: { isActive: false },
      include: { images: true, category: true },
    });
  }

  async hardDelete(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { orderItems: { take: 1 } },
    });

    if (!product) throw new NotFoundException('Product not found');

    if (product.orderItems.length > 0) {
      throw new BadRequestException('Cannot delete product with existing orders. Use soft delete instead.');
    }

    return this.prisma.product.delete({ where: { id } });
  }
}
