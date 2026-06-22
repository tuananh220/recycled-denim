import { IsString, IsNotEmpty, IsOptional, IsBoolean, Matches } from 'class-validator';

export class CreateAddressDto {
  @IsString() @IsNotEmpty() fullName: string;
  @IsString() @IsNotEmpty()
  @Matches(/^[0-9]{10,11}$|^\+84[0-9]{9,10}$/, {
    message: 'Phone must be Vietnamese format (10-11 digits starting with 0 or +84)',
  })
  phone: string;
  @IsString() @IsNotEmpty() line1: string;
  @IsString() @IsOptional() line2?: string;
  @IsString() @IsNotEmpty() city: string;
  @IsString() @IsOptional() region?: string;
  @IsString() @IsNotEmpty() postalCode: string;
  @IsString() @IsNotEmpty() country: string;
  @IsBoolean() @IsOptional() isDefault?: boolean;
}

export class UpdateAddressDto {
  @IsString() @IsOptional() fullName?: string;
  @IsString() @IsOptional()
  @Matches(/^[0-9]{10,11}$|^\+84[0-9]{9,10}$/, {
    message: 'Phone must be Vietnamese format (10-11 digits starting with 0 or +84)',
  })
  phone?: string;
  @IsString() @IsOptional() line1?: string;
  @IsString() @IsOptional() line2?: string;
  @IsString() @IsOptional() city?: string;
  @IsString() @IsOptional() region?: string;
  @IsString() @IsOptional() postalCode?: string;
  @IsString() @IsOptional() country?: string;
  @IsBoolean() @IsOptional() isDefault?: boolean;
}
