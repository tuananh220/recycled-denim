import { Body, Controller, Delete, Get, Module, Param, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('categories')
@Controller('categories')
class CategoriesController {
  constructor(private prisma: PrismaService) {}

  @Public() @Get()
  list() { return this.prisma.category.findMany({ orderBy: { name: 'asc' } }); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard) @Roles(Role.ADMIN) @Post()
  create(@Body() dto: { name: string; slug: string; description?: string; imageUrl?: string; parentId?: string }) {
    return this.prisma.category.create({ data: dto });
  }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard) @Roles(Role.ADMIN) @Delete(':id')
  remove(@Param('id') id: string) { return this.prisma.category.delete({ where: { id } }); }
}

@Module({ controllers: [CategoriesController] })
export class CategoriesModule {}
