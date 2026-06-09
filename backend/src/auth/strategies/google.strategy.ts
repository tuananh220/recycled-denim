import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';

/**
 * Google OAuth 2.0 strategy.
 * Setup at https://console.cloud.google.com → APIs & Services → Credentials
 *   - OAuth client type: Web application
 *   - Authorized redirect URIs: {API_URL}/auth/google/callback
 */
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger(GoogleStrategy.name);

  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID || 'missing',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'missing',
      callbackURL: `${process.env.API_URL || 'http://localhost:4000/api'}/auth/google/callback`,
      scope: ['email', 'profile'],
    });
    if (!process.env.GOOGLE_CLIENT_ID) this.logger.warn('GoogleStrategy: GOOGLE_CLIENT_ID not set');
  }

  async validate(_at: string, _rt: string, profile: Profile, done: VerifyCallback) {
    const user = {
      provider: 'google',
      providerId: profile.id,
      email: profile.emails?.[0]?.value,
      name: profile.displayName,
      avatarUrl: profile.photos?.[0]?.value,
    };
    done(null, user);
  }
}
