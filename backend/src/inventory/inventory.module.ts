import { Body, Controller, Get, Module, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Roles(Role.ADMIN, Role.WAREHOUSE)
@Controller('inventory')
class InventoryController {
  constructor(private prisma: PrismaService) {}

  @Get()
  all() {
    return this.prisma.inventory.findMany({
      include: { product: { select: { id: true, name: true, slug: true } } },
      orderBy: { updatedAt: 'desc' },
    });
  }

  @Get('product/:productId')
  byProduct(@Param('productId') productId: string) {
    return this.prisma.inventory.findMany({ where: { productId } });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: { quantity: number }) {
    return this.prisma.inventory.update({ where: { id }, data: { quantity: dto.quantity } });
  }
}

@Module({ controllers: [InventoryController] })
export class InventoryModule {}
