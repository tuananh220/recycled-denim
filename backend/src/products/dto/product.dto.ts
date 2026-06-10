import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsIn, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateProductDto {
  @IsString() name: string;
  @IsString() slug: string;
  @IsString() description: string;
  @IsNumber() price: number;
  @IsOptional() @IsNumber() compareAtPrice?: number;
  @IsArray() sizes: string[];
  @IsArray() colors: string[];
  @IsOptional() @IsInt() recycledPercent?: number;
  @IsString() categoryId: string;
  @IsOptional() @IsArray() imageUrls?: string[];
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional() @IsBoolean() isFeatured?: boolean;
}

export class UpdateProductDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() slug?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsNumber() price?: number;
  @IsOptional() @IsNumber() compareAtPrice?: number;
  @IsOptional() @IsArray() sizes?: string[];
  @IsOptional() @IsArray() colors?: string[];
  @IsOptional() @IsInt() recycledPercent?: number;
  @IsOptional() @IsString() categoryId?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional() @IsBoolean() isFeatured?: boolean;
  @IsOptional() @IsArray() imageUrls?: string[];
}

export class QueryProductDto {
  @IsOptional() @IsString() q?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsString() size?: string;
  @IsOptional() @IsString() color?: string;

  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) minPrice?: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) maxPrice?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) pageSize?: number;

  @IsOptional() @IsIn(['newest', 'price_asc', 'price_desc'])
  sort?: 'newest' | 'price_asc' | 'price_desc';
}
