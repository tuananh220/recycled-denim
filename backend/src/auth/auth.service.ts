import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcryptjs from 'bcryptjs';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private mail: MailService,
  ) {}

  private async signTokens(userId: string, role: string) {
    const access = await this.jwt.signAsync(
      { sub: userId, role },
      { secret: process.env.JWT_ACCESS_SECRET, expiresIn: process.env.JWT_ACCESS_TTL || '15m' },
    );
    const refresh = await this.jwt.signAsync(
      { sub: userId, role, type: 'refresh' },
      { secret: process.env.JWT_REFRESH_SECRET, expiresIn: process.env.JWT_REFRESH_TTL || '7d' },
    );
    return { accessToken: access, refreshToken: refresh };
  }

  private serialize(user: any) {
    return {
      id: user.id, email: user.email, name: user.name, role: user.role,
      avatarUrl: user.avatarUrl, emailVerified: user.emailVerified,
    };
  }

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new BadRequestException('Email already registered');

    const passwordHash = await bcryptjs.hash(dto.password, 10);
    const emailVerifyToken = randomBytes(32).toString('hex');
    const user = await this.prisma.user.create({
      data: {
        email: dto.email, name: dto.name, passwordHash, emailVerifyToken,
        cart: { create: {} },
      },
    });
    await this.mail.sendVerification(user.email, emailVerifyToken).catch(() => null);

    const tokens = await this.signTokens(user.id, user.role);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenHash: await bcryptjs.hash(tokens.refreshToken, 10) },
    });
    return { user: this.serialize(user), ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const ok = await bcryptjs.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const tokens = await this.signTokens(user.id, user.role);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenHash: await bcrypt.hash(tokens.refreshToken, 10) },
    });
    return { user: this.serialize(user), ...tokens };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = await this.jwt.verifyAsync(refreshToken, { secret: process.env.JWT_REFRESH_SECRET });
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user?.refreshTokenHash) throw new UnauthorizedException();
      const valid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
      if (!valid) throw new UnauthorizedException();

      const tokens = await this.signTokens(user.id, user.role);
      await this.prisma.user.update({
        where: { id: user.id },
        data: { refreshTokenHash: await bcrypt.hash(tokens.refreshToken, 10) },
      });
      return tokens;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string) {
    await this.prisma.user.update({ where: { id: userId }, data: { refreshTokenHash: null } });
    return { success: true };
  }

  async verifyEmail(token: string) {
    const user = await this.prisma.user.findUnique({ where: { emailVerifyToken: token } });
    if (!user) throw new BadRequestException('Invalid token');
    await this.prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, emailVerifyToken: null },
    });
    return { success: true };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return { success: true }; // don't leak
    const token = randomBytes(32).toString('hex');
    await this.prisma.user.update({
      where: { id: user.id },
      data: { resetToken: token, resetTokenExpiry: new Date(Date.now() + 1000 * 60 * 30) },
    });
    await this.mail.sendPasswordReset(email, token).catch(() => null);
    return { success: true };
  }

  async resetPassword(token: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { resetToken: token } });
    if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      throw new BadRequestException('Invalid or expired token');
    }
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: await bcrypt.hash(password, 10), resetToken: null, resetTokenExpiry: null },
    });
    return { success: true };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    return this.serialize(user);
  }
}
