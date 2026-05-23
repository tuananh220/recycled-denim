import { Body, Controller, Delete, Get, Module, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('testimonials')
@Controller('testimonials')
class TestimonialsController {
  constructor(private prisma: PrismaService) {}

  @Public() @Get()
  list() {
    return this.prisma.testimonial.findMany({
      where: { isActive: true }, orderBy: { position: 'asc' },
    });
  }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard) @Roles(Role.ADMIN) @Post()
  create(@Body() dto: any) { return this.prisma.testimonial.create({ data: dto }); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard) @Roles(Role.ADMIN) @Patch(':id')
  update(@Param('id') id: string, @Body() dto: any) {
    return this.prisma.testimonial.update({ where: { id }, data: dto });
  }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard) @Roles(Role.ADMIN) @Delete(':id')
  remove(@Param('id') id: string) { return this.prisma.testimonial.delete({ where: { id } }); }
}

@Module({ controllers: [TestimonialsController] })
export class TestimonialsModule {}
