import { IsString } from 'class-validator';

export class CreateTryOnDto {
  @IsString() productId: string;
  /** A Cloudinary URL or base64 data URI of the user's photo */
  @IsString() userImageUrl: string;
}
