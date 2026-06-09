import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-facebook';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  private readonly logger = new Logger(FacebookStrategy.name);

  constructor() {
    super({
      clientID: process.env.FACEBOOK_CLIENT_ID || 'missing',
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || 'missing',
      callbackURL: `${process.env.API_URL || 'http://localhost:4000/api'}/auth/facebook/callback`,
      profileFields: ['id', 'displayName', 'emails', 'photos'],
      scope: ['email'],
    });
    if (!process.env.FACEBOOK_CLIENT_ID) this.logger.warn('FacebookStrategy: FACEBOOK_CLIENT_ID not set');
  }

  async validate(_at: string, _rt: string, profile: Profile, done: (e: any, u?: any) => void) {
    const user = {
      provider: 'facebook',
      providerId: profile.id,
      email: profile.emails?.[0]?.value,
      name: profile.displayName,
      avatarUrl: profile.photos?.[0]?.value,
    };
    done(null, user);
  }
}
