import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-github2';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  private readonly logger = new Logger(GithubStrategy.name);

  constructor() {
    super({
      clientID: process.env.GITHUB_CLIENT_ID || 'missing',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || 'missing',
      callbackURL: `${process.env.API_URL || 'http://localhost:4000/api'}/auth/github/callback`,
      scope: ['user:email'],
    });
    if (!process.env.GITHUB_CLIENT_ID) this.logger.warn('GithubStrategy: GITHUB_CLIENT_ID not set');
  }

  async validate(_at: string, _rt: string, profile: Profile, done: (e: any, u?: any) => void) {
    const user = {
      provider: 'github',
      providerId: profile.id,
      email: profile.emails?.[0]?.value,
      name: profile.displayName || profile.username,
      avatarUrl: profile.photos?.[0]?.value,
    };
    done(null, user);
  }
}
