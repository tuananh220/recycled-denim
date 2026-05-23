import { Body, Controller, Delete, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}

  @Patch('me')
  updateProfile(@CurrentUser('id') id: string, @Body() dto: { name?: string; phone?: string; avatarUrl?: string }) {
    return this.users.updateProfile(id, dto);
  }

  @Roles(Role.ADMIN) @Get()
  list(@Query('page') page = '1', @Query('pageSize') pageSize = '20') {
    return this.users.list(+page, +pageSize);
  }

  @Roles(Role.ADMIN) @Patch(':id/role')
  setRole(@Param('id') id: string, @Body() body: { role: Role }) {
    return this.users.updateRole(id, body.role);
  }

  @Roles(Role.ADMIN) @Delete(':id')
  remove(@Param('id') id: string) { return this.users.remove(id); }
}
