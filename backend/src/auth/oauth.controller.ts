import { Controller, Get, Logger, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { AuthService, OAuthProfile } from './auth.service';

/**
 * OAuth flow:
 *   GET /auth/{provider}/login      → redirects to provider's consent screen
 *   GET /auth/{provider}/callback   → provider redirects back here →
 *                                     we sign tokens and redirect to FE with them in URL hash
 *
 * Frontend reads the hash on /auth/callback and stores tokens.
 */
@ApiTags('auth-oauth')
@Public()
@Controller('auth')
export class OAuthController {
  private readonly logger = new Logger(OAuthController.name);
  private readonly appUrl = process.env.APP_URL || 'http://localhost:3000';

  constructor(private auth: AuthService) {}

  // ----- Google -----
  @Get('google/login')
  @UseGuards(AuthGuard('google'))
  google() { /* AuthGuard does the redirect */ }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    return this.handleCallback(req, res, 'google');
  }

  // ----- Facebook -----
  @Get('facebook/login')
  @UseGuards(AuthGuard('facebook'))
  facebook() {}

  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  async facebookCallback(@Req() req: Request, @Res() res: Response) {
    return this.handleCallback(req, res, 'facebook');
  }

  // ----- GitHub -----
  @Get('github/login')
  @UseGuards(AuthGuard('github'))
  github() {}

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubCallback(@Req() req: Request, @Res() res: Response) {
    return this.handleCallback(req, res, 'github');
  }

  // ----- Shared callback handler -----
  private async handleCallback(req: Request, res: Response, provider: string) {
    try {
      const profile = req.user as OAuthProfile;
      const result = await this.auth.loginWithOAuth(profile);

      // Pass tokens to frontend via URL hash (not query — hash is never logged)
      const hash = new URLSearchParams({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      }).toString();

      return res.redirect(`${this.appUrl}/auth/callback#${hash}`);
    } catch (e: any) {
      this.logger.error(`OAuth callback failed (${provider}): ${e.message}`);
      const err = encodeURIComponent(e.message || 'OAuth failed');
      return res.redirect(`${this.appUrl}/login?error=${err}`);
    }
  }
}
