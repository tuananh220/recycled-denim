import { Module, Provider } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { APP_GUARD } from '@nestjs/core';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { OAuthController } from './oauth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { FacebookStrategy } from './strategies/facebook.strategy';
import { GithubStrategy } from './strategies/github.strategy';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { MailModule } from '../mail/mail.module';

// Only register OAuth strategies whose env vars are present (avoids "missing clientID" errors).
const oauthStrategies: Provider[] = [];
if (process.env.GOOGLE_CLIENT_ID)   oauthStrategies.push(GoogleStrategy);
if (process.env.FACEBOOK_CLIENT_ID) oauthStrategies.push(FacebookStrategy);
if (process.env.GITHUB_CLIENT_ID)   oauthStrategies.push(GithubStrategy);

@Module({
  imports: [PassportModule, JwtModule.register({}), MailModule],
  controllers: [AuthController, OAuthController],
  providers: [
    AuthService,
    JwtStrategy,
    ...oauthStrategies,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
  exports: [AuthService],
})
export class AuthModule {}
