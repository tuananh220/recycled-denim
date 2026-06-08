import { Body, Controller, Get, Module, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { CreateTryOnDto } from './dto/tryon.dto';
import { TryonService } from './tryon.service';

@ApiTags('tryon')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tryon')
class TryonController {
  constructor(private svc: TryonService) {}

  /** Public — check which AI provider the backend is currently using */
  @Public() @Get('info')
  info() { return this.svc.getProviderInfo(); }

  @Post()
  create(@CurrentUser('id') uid: string, @Body() dto: CreateTryOnDto) {
    return this.svc.create(uid, dto.productId, dto.userImageUrl);
  }

  @Get('mine')
  mine(@CurrentUser('id') uid: string) { return this.svc.myHistory(uid); }

  @Roles(Role.ADMIN) @Get()
  all() { return this.svc.listAll(); }
}

@Module({ controllers: [TryonController], providers: [TryonService] })
export class TryonModule {}
