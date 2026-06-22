import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';

@Injectable()
export class AddressesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateAddressDto) {
    if (dto.isDefault === true) {
      await this.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    return this.prisma.address.create({
      data: {
        userId,
        ...dto,
        isDefault: dto.isDefault ?? false,
      },
    });
  }

  async findAll(userId: string, page = 1, pageSize = 10) {
    const [addresses, total] = await this.prisma.$transaction([
      this.prisma.address.findMany({
        where: { userId },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { isDefault: 'desc' },
      }),
      this.prisma.address.count({ where: { userId } }),
    ]);

    return {
      data: addresses,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async findOne(id: string, userId: string) {
    const address = await this.prisma.address.findUnique({
      where: { id },
    });

    if (!address || address.userId !== userId) {
      throw new NotFoundException('Address not found');
    }

    return address;
  }

  async update(id: string, userId: string, dto: UpdateAddressDto) {
    const address = await this.findOne(id, userId);

    if (dto.isDefault === true) {
      await this.prisma.address.updateMany({
        where: { userId, id: { not: id } },
        data: { isDefault: false },
      });
    }

    return this.prisma.address.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.address.delete({ where: { id } });
  }

  async setDefault(id: string, userId: string) {
    await this.findOne(id, userId);

    await this.prisma.address.updateMany({
      where: { userId, id: { not: id } },
      data: { isDefault: false },
    });

    return this.prisma.address.update({
      where: { id },
      data: { isDefault: true },
    });
  }
}
