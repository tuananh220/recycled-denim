import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateProductDto, QueryProductDto, UpdateProductDto } from './dto/product.dto';
import { ProductsService } from './products.service';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private products: ProductsService) {}

  @Public() @Get()
  list(@Query() q: QueryProductDto) { return this.products.list(q); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard) @Roles(Role.ADMIN) @Get('admin/all')
  listAdmin(@Query() q: QueryProductDto) { return this.products.listAdmin(q); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard) @Roles(Role.ADMIN) @Get('admin/:id')
  getById(@Param('id') id: string) { return this.products.getById(id); }

  @Public() @Get(':slug')
  bySlug(@Param('slug') slug: string) { return this.products.getBySlug(slug); }

  @Public() @Get(':slug/related')
  related(@Param('slug') slug: string) { return this.products.related(slug); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard) @Roles(Role.ADMIN) @Post()
  create(@Body() dto: CreateProductDto) { return this.products.create(dto); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard) @Roles(Role.ADMIN) @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) { return this.products.update(id, dto); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard) @Roles(Role.ADMIN) @Delete(':id')
  remove(@Param('id') id: string) { return this.products.remove(id); }
}
