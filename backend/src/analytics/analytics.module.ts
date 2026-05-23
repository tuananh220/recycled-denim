import { Controller, Get, Module, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Roles(Role.ADMIN)
@Controller('analytics')
class AnalyticsController {
  constructor(private prisma: PrismaService) {}

  @Get('overview')
  async overview() {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [users, products, orders, revenueAgg, tryOns, designs, recentOrders] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.product.count({ where: { isActive: true } }),
      this.prisma.order.count(),
      this.prisma.order.aggregate({
        _sum: { total: true },
        where: { paymentStatus: 'SUCCEEDED', createdAt: { gte: since } },
      }),
      this.prisma.tryOnRequest.count({ where: { createdAt: { gte: since } } }),
      this.prisma.customDesign.count({ where: { status: { in: ['SUBMITTED', 'IN_REVIEW'] } } }),
      this.prisma.order.findMany({
        take: 10, orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, email: true } } },
      }),
    ]);

    // Revenue by day (last 14 days)
    const rows = await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT date_trunc('day', "createdAt") AS day, SUM(total)::float AS revenue
      FROM "Order"
      WHERE "createdAt" > NOW() - INTERVAL '14 days'
      GROUP BY 1 ORDER BY 1;
    `).catch(() => []);

    return {
      counts: { users, products, orders, tryOns, pendingDesigns: designs },
      revenue30d: Number(revenueAgg._sum.total ?? 0),
      revenueByDay: rows,
      recentOrders,
    };
  }
}

@Module({ controllers: [AnalyticsController] })
export class AnalyticsModule {}
