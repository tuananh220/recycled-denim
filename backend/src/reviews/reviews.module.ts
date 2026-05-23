import { Body, Controller, Delete, Get, Module, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('reviews')
@Controller('reviews')
class ReviewsController {
  constructor(private prisma: PrismaService) {}

  @Public() @Get('product/:productId')
  list(@Param('productId') productId: string) {
    return this.prisma.review.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    });
  }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard) @Post()
  create(
    @CurrentUser('id') userId: string,
    @Body() dto: { productId: string; rating: number; title?: string; comment: string; imageUrls?: string[] },
  ) {
    return this.prisma.review.upsert({
      where: { userId_productId: { userId, productId: dto.productId } },
      update: { rating: dto.rating, title: dto.title, comment: dto.comment, imageUrls: dto.imageUrls ?? [] },
      create: {
        userId, productId: dto.productId, rating: dto.rating,
        title: dto.title, comment: dto.comment, imageUrls: dto.imageUrls ?? [],
      },
    });
  }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard) @Delete(':id')
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.prisma.review.deleteMany({ where: { id, userId } });
  }
}

@Module({ controllers: [ReviewsController] })
export class ReviewsModule {}
