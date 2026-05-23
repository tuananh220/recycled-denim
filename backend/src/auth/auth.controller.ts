import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  ForgotPasswordDto, LoginDto, RefreshDto, RegisterDto, ResetPasswordDto, VerifyEmailDto,
} from './dto/auth.dto';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Public() @Post('register')
  register(@Body() dto: RegisterDto) { return this.auth.register(dto); }

  @Public() @Post('login')
  login(@Body() dto: LoginDto) { return this.auth.login(dto); }

  @Public() @Post('refresh')
  refresh(@Body() dto: RefreshDto) { return this.auth.refresh(dto.refreshToken!); }

  @Public() @Post('verify-email')
  verify(@Body() dto: VerifyEmailDto) { return this.auth.verifyEmail(dto.token); }

  @Public() @Post('forgot-password')
  forgot(@Body() dto: ForgotPasswordDto) { return this.auth.forgotPassword(dto.email); }

  @Public() @Post('reset-password')
  reset(@Body() dto: ResetPasswordDto) { return this.auth.resetPassword(dto.token, dto.password); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard) @Post('logout')
  logout(@CurrentUser('id') id: string) { return this.auth.logout(id); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard) @Get('me')
  me(@CurrentUser('id') id: string) { return this.auth.me(id); }
}
