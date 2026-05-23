import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsString() name: string;
  @IsEmail()  email: string;
  @MinLength(8) password: string;
}

export class LoginDto {
  @IsEmail() email: string;
  @IsString() password: string;
}

export class ForgotPasswordDto { @IsEmail() email: string; }
export class ResetPasswordDto  { @IsString() token: string; @MinLength(8) password: string; }
export class VerifyEmailDto    { @IsString() token: string; }
export class RefreshDto        { @IsOptional() @IsString() refreshToken?: string; }
