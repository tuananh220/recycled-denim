import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { OrderStatus, PaymentProvider } from '@prisma/client';

export class CheckoutDto {
  @IsObject() shippingAddress: any;
  @IsEnum(PaymentProvider) paymentProvider: PaymentProvider;
  @IsOptional() @IsString() couponCode?: string;
  @IsOptional() @IsString() notes?: string;
}

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus) status: OrderStatus;
  @IsOptional() @IsString() trackingNumber?: string;
}
