import { Module } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { CacheService } from './cache.service';

@Module({
  imports: [
    NestCacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
      auth_pass: process.env.REDIS_PASSWORD,
      ttl: 3600,
    }),
  ],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModuleConfig {}
