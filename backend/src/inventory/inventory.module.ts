import { Body, Controller, Get, Module, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { InventoryService } from './inventory.service';

@ApiTags('inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Roles(Role.ADMIN, Role.WAREHOUSE)
@Controller('inventory')
class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  @Get()
  all() {
    return this.inventoryService.getAll();
  }

  @Get('product/:productId')
  byProduct(@Param('productId') productId: string) {
    return this.inventoryService.getByProduct(productId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: { quantity: number }) {
    return this.inventoryService.updateQuantity(id, dto.quantity);
  }

  @Post('adjust/:id')
  adjust(@Param('id') id: string, @Body() dto: { adjustment: number; reason?: string }) {
    return this.inventoryService.adjustQuantity(id, dto.adjustment, dto.reason);
  }
}

@Module({
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}

