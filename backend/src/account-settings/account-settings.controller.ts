import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AccountSettingsService, AccountSettingsUpdateDto } from './account-settings.service';

@ApiTags('account-settings')
@Controller('account-settings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AccountSettingsController {
  constructor(private settingsService: AccountSettingsService) {}

  @Get()
  get(@CurrentUser('id') userId: string) {
    return this.settingsService.getOrCreate(userId);
  }

  @Patch()
  update(@CurrentUser('id') userId: string, @Body() dto: AccountSettingsUpdateDto) {
    return this.settingsService.update(userId, dto);
  }
}
