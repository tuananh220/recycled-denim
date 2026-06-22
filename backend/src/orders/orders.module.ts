import { Body, Controller, Get, Module, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { OrdersService } from './orders.service';
import { CheckoutDto, UpdateOrderStatusDto } from './dto/order.dto';
import { InventoryModule } from '../inventory/inventory.module';

@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
class OrdersController {
  constructor(private orders: OrdersService) {}

  @Post('checkout')
  checkout(@CurrentUser('id') uid: string, @Body() dto: CheckoutDto) {
    return this.orders.checkout(uid, dto);
  }

  @Get('mine')
  mine(@CurrentUser('id') uid: string) {
    return this.orders.myOrders(uid);
  }

  @Get(':id')
  one(@CurrentUser() user: any, @Param('id') id: string) {
    return this.orders.getOne(user.id, id, ['ADMIN', 'STAFF'].includes(user.role));
  }

  @Roles(Role.ADMIN, Role.STAFF)
  @Get()
  list(@Query('page') page = '1', @Query('pageSize') ps = '20') {
    return this.orders.listAll(+page, +ps);
  }

  @Roles(Role.ADMIN, Role.STAFF)
  @Patch(':id/status')
  setStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser('id') uid: string,
  ) {
    return this.orders.updateStatus(id, dto, uid);
  }

  @Post(':id/cancel')
  cancel(@CurrentUser('id') uid: string, @Param('id') id: string) {
    return this.orders.cancel(uid, id);
  }
}

@Module({
  imports: [InventoryModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}

