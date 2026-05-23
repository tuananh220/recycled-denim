import { Body, Controller, Delete, Get, Module, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CartService } from './cart.service';

@ApiTags('cart')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cart')
class CartController {
  constructor(private cart: CartService) {}

  @Get()
  get(@CurrentUser('id') uid: string) { return this.cart.get(uid); }

  @Post('items')
  add(@CurrentUser('id') uid: string, @Body() dto: any) { return this.cart.addItem(uid, dto); }

  @Patch('items/:id')
  update(@CurrentUser('id') uid: string, @Param('id') id: string, @Body() dto: { quantity: number }) {
    return this.cart.updateItem(uid, id, dto.quantity);
  }

  @Delete('items/:id')
  remove(@CurrentUser('id') uid: string, @Param('id') id: string) {
    return this.cart.removeItem(uid, id);
  }

  @Delete()
  clear(@CurrentUser('id') uid: string) { return this.cart.clear(uid); }
}

@Module({ controllers: [CartController], providers: [CartService] })
export class CartModule {}
