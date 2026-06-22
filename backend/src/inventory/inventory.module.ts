import { Body, Controller, Get, Module, Param, Patch, UseGuards } from '@nestjs/common';
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
}

@Module({
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}

