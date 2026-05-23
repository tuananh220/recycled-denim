import { Body, Controller, Delete, Get, Module, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('coupons')
@Controller('coupons')
class CouponsController {
  constructor(private prisma: PrismaService) {}

  @Public() @Get('validate/:code')
  validate(@Param('code') code: string) {
    return this.prisma.coupon.findFirst({
      where: { code, isActive: true, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
    });
  }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard) @Roles(Role.ADMIN) @Get()
  list() { return this.prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } }); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard) @Roles(Role.ADMIN) @Post()
  create(@Body() dto: any) { return this.prisma.coupon.create({ data: dto }); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard) @Roles(Role.ADMIN) @Delete(':id')
  remove(@Param('id') id: string) { return this.prisma.coupon.delete({ where: { id } }); }
}

@Module({ controllers: [CouponsController] })
export class CouponsModule {}
