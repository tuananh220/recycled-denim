import { Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

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

  remove(id: string) { return this.prisma.user.delete({ where: { id } }); }
}
