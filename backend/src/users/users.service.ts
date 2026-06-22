import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService, private mail: MailService) {}

  list(page = 1, pageSize = 20) {
    return this.prisma.$transaction([
      this.prisma.user.findMany({
        skip: (page - 1) * pageSize, take: pageSize,
        orderBy: { createdAt: 'desc' },
        select: { id: true, email: true, name: true, role: true, createdAt: true, emailVerified: true },
      }),
      this.prisma.user.count(),
    ]).then(([data, total]) => ({ data, meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } }));
  }

  async updateRole(id: string, role: Role) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException();
    return this.prisma.user.update({ where: { id }, data: { role } });
  }

  updateProfile(id: string, dto: { name?: string; phone?: string; avatarUrl?: string }) {
    return this.prisma.user.update({ where: { id }, data: dto });
  }

  async changePassword(id: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    if (!user.passwordHash) throw new BadRequestException('OAuth account cannot change password');

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) throw new UnauthorizedException('Current password is incorrect');

    const passwordHash = await bcrypt.hash(newPassword, 10);
    return this.prisma.user.update({ where: { id }, data: { passwordHash } });
  }

  async requestEmailChange(id: string, newEmail: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const exists = await this.prisma.user.findUnique({ where: { email: newEmail } });
    if (exists) throw new BadRequestException('Email already in use');

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 min

    await this.prisma.user.update({
      where: { id },
      data: {
        resetToken: token,
        resetTokenExpiry: expiresAt,
      },
    });

    await this.mail.sendEmailChangeRequest(newEmail, token);
    return { message: 'Verification email sent to new email address' };
  }

  async verifyEmailChange(id: string, token: string, newEmail: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    if (user.resetToken !== token) throw new BadRequestException('Invalid or expired token');
    if (!user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      throw new BadRequestException('Token has expired');
    }

    const exists = await this.prisma.user.findUnique({ where: { email: newEmail } });
    if (exists) throw new BadRequestException('Email already in use');

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        email: newEmail,
        emailVerified: true,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    await this.mail.sendEmailChangeNotification(newEmail, user.email);
    return { message: 'Email changed successfully' };
  }

  async changePhone(id: string, phone: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.user.update({
      where: { id },
      data: { phone },
    });
  }

  remove(id: string) { return this.prisma.user.delete({ where: { id } }); }
}
