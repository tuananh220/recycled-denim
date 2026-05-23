import { Body, Controller, Get, Module, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DesignStatus, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateDesignDto, ReviewDesignDto } from './dto/design.dto';

@ApiTags('designs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('designs')
class DesignsController {
  constructor(private prisma: PrismaService) {}

  @Post()
  create(@CurrentUser('id') userId: string, @Body() dto: CreateDesignDto) {
    return this.prisma.customDesign.create({
      data: {
        userId, title: dto.title, productId: dto.productId,
        designJson: dto.designJson, previewUrl: dto.previewUrl,
        status: DesignStatus.DRAFT,
      },
    });
  }

  @Get('mine')
  mine(@CurrentUser('id') userId: string) {
    return this.prisma.customDesign.findMany({
      where: { userId }, orderBy: { updatedAt: 'desc' },
    });
  }

  @Patch(':id/submit')
  submit(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.prisma.customDesign.updateMany({
      where: { id, userId },
      data: { status: DesignStatus.SUBMITTED },
    });
  }

  @Roles(Role.DESIGNER, Role.ADMIN) @Get('queue')
  queue() {
    return this.prisma.customDesign.findMany({
      where: { status: { in: [DesignStatus.SUBMITTED, DesignStatus.IN_REVIEW] } },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  @Roles(Role.DESIGNER, Role.ADMIN) @Patch(':id/review')
  review(
    @CurrentUser('id') reviewerId: string,
    @Param('id') id: string,
    @Body() dto: ReviewDesignDto,
  ) {
    return this.prisma.customDesign.update({
      where: { id },
      data: {
        status: dto.status,
        reviewerNotes: dto.reviewerNotes,
        reviewedById: reviewerId,
        ...(dto.designJson ? { designJson: dto.designJson } : {}),
      },
    });
  }
}

@Module({ controllers: [DesignsController] })
export class DesignsModule {}
