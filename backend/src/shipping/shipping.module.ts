import { Body, Controller, Module, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ShippingService } from './shipping.service';

@ApiTags('shipping')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('shipping')
class ShippingController {
  constructor(private shipping: ShippingService) {}

  @Post('calculate')
  calculate(@Body() body: {
    provinceCode: number;
    districtCode: number;
    wardCode?: string;
    weight?: number;        // default 500g for denim accessories
    totalValue: number;
  }) {
    return this.shipping.calculateFee({
      toDistrictCode: body.districtCode,
      toWardCode: body.wardCode,
      weight: body.weight ?? 500,
      totalValue: body.totalValue,
      provinceCode: body.provinceCode,
    });
  }
}

@Module({ controllers: [ShippingController], providers: [ShippingService], exports: [ShippingService] })
export class ShippingModule {}
