import { Body, Controller, Delete, Get, Module, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('wishlist')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('wishlist')
class WishlistController {
  constructor(private prisma: PrismaService) {}

  @Get()
  mine(@CurrentUser('id') userId: string) {
    return this.prisma.wishlistItem.findMany({
      where: { userId },
      include: { product: { include: { images: { take: 1, orderBy: { position: 'asc' } } } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Post()
  add(@CurrentUser('id') userId: string, @Body() dto: { productId: string }) {
    return this.prisma.wishlistItem.upsert({
      where: { userId_productId: { userId, productId: dto.productId } },
      update: {}, create: { userId, productId: dto.productId },
    });
  }

  @Delete(':productId')
  remove(@CurrentUser('id') userId: string, @Param('productId') productId: string) {
    return this.prisma.wishlistItem.deleteMany({ where: { userId, productId } });
  }
}

@Module({ controllers: [WishlistController] })
export class WishlistModule {}
