import { Body, Controller, Delete, Get, Module, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PostStatus, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('posts')
@Controller('posts')
class PostsController {
  constructor(private prisma: PrismaService) {}

  // ---------- Public ----------
  @Public() @Get()
  list(@Query('tag') tag?: string) {
    return this.prisma.post.findMany({
      where: {
        status: PostStatus.PUBLISHED,
        ...(tag ? { tags: { has: tag } } : {}),
      },
      orderBy: { publishedAt: 'desc' },
      include: { author: { select: { name: true, avatarUrl: true } } },
    });
  }

  @Public() @Get(':slug')
  bySlug(@Param('slug') slug: string) {
    return this.prisma.post.findUnique({
      where: { slug },
      include: { author: { select: { name: true, avatarUrl: true } } },
    });
  }

  // ---------- Admin ----------
  @ApiBearerAuth() @UseGuards(JwtAuthGuard) @Roles(Role.ADMIN) @Get('admin/all')
  listAll() { return this.prisma.post.findMany({ orderBy: { createdAt: 'desc' } }); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard) @Roles(Role.ADMIN) @Post()
  create(@CurrentUser('id') authorId: string, @Body() dto: any) {
    const publishedAt =
      dto.status === PostStatus.PUBLISHED && !dto.publishedAt ? new Date() : dto.publishedAt;
    return this.prisma.post.create({ data: { ...dto, authorId, publishedAt } });
  }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard) @Roles(Role.ADMIN) @Patch(':id')
  update(@Param('id') id: string, @Body() dto: any) {
    const data: any = { ...dto };
    if (dto.status === PostStatus.PUBLISHED && !dto.publishedAt) data.publishedAt = new Date();
    return this.prisma.post.update({ where: { id }, data });
  }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard) @Roles(Role.ADMIN) @Delete(':id')
  remove(@Param('id') id: string) { return this.prisma.post.delete({ where: { id } }); }
}

@Module({ controllers: [PostsController] })
export class PostsModule {}
