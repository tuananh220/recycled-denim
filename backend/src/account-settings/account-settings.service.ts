import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AccountSettingsUpdateDto {
  emailNotifications?: boolean;
  emailOnOrderStatus?: boolean;
  emailPromotions?: boolean;
  profilePublic?: boolean;
}

@Injectable()
export class AccountSettingsService {
  constructor(private prisma: PrismaService) {}

  async getOrCreate(userId: string) {
    let settings = await this.prisma.accountSettings.findUnique({
      where: { userId },
    });

    if (!settings) {
      settings = await this.prisma.accountSettings.create({
        data: { userId },
      });
    }

    return settings;
  }

  async update(userId: string, dto: AccountSettingsUpdateDto) {
    return this.prisma.accountSettings.upsert({
      where: { userId },
      update: dto,
      create: {
        userId,
        ...dto,
      },
    });
  }
}
