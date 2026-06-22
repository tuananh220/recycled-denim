import {
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
  IsNotEmpty,
  MinLength,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { OrderStatus, PaymentProvider } from '@prisma/client';
import { Type } from 'class-transformer';

export class ShippingAddressDto {
  @IsString() @IsNotEmpty() fullName: string;
  @IsString() @IsNotEmpty() phone: string;
  @IsString() @IsNotEmpty() line1: string;
  @IsString() @IsNotEmpty() city: string;
  @IsString() @IsNotEmpty() district: string;
  @IsString() @IsNotEmpty() ward: string;
  @IsString() @IsNotEmpty() postalCode: string;
  @IsString() country: string;
}

export class CheckoutDto {
  @IsObject()
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress: ShippingAddressDto;

  @IsOptional()
  @IsEnum(PaymentProvider)
  paymentProvider?: PaymentProvider;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  couponCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(100)
  trackingNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

