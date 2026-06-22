import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
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

  @Patch('me/password')
  changePassword(
    @CurrentUser('id') id: string,
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    return this.users.changePassword(id, body.currentPassword, body.newPassword);
  }

  @Patch('me/email')
  requestEmailChange(@CurrentUser('id') id: string, @Body() body: { newEmail: string }) {
    return this.users.requestEmailChange(id, body.newEmail);
  }

  @Post('me/email/verify')
  verifyEmailChange(
    @CurrentUser('id') id: string,
    @Body() body: { token: string; newEmail: string },
  ) {
    return this.users.verifyEmailChange(id, body.token, body.newEmail);
  }

  @Patch('me/phone')
  changePhone(@CurrentUser('id') id: string, @Body() body: { phone: string }) {
    return this.users.changePhone(id, body.phone);
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
