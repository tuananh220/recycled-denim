import { IsEnum, IsOptional, IsString } from 'class-validator';
import { DesignStatus } from '@prisma/client';

export class CreateDesignDto {
  @IsString() title: string;
  @IsOptional() @IsString() productId?: string;
  // Fabric.js JSON
  designJson: any;
  @IsOptional() @IsString() previewUrl?: string;
}

export class ReviewDesignDto {
  @IsEnum(DesignStatus) status: DesignStatus;
  @IsOptional() @IsString() reviewerNotes?: string;
  @IsOptional() designJson?: any;
}
