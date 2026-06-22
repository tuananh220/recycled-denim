import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

import { PrismaModule } from './prisma/prisma.module';
import { CacheModuleConfig } from './cache/cache.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { ReviewsModule } from './reviews/reviews.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { TryonModule } from './tryon/tryon.module';
import { DesignsModule } from './designs/designs.module';
import { InventoryModule } from './inventory/inventory.module';
import { CouponsModule } from './coupons/coupons.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { UploadModule } from './upload/upload.module';
import { MailModule } from './mail/mail.module';
import { BannersModule } from './banners/banners.module';
import { PostsModule } from './posts/posts.module';
import { FaqModule } from './faq/faq.module';
import { TestimonialsModule } from './testimonials/testimonials.module';
import { ShippingModule } from './shipping/shipping.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    PrismaModule,
    CacheModuleConfig,
    MailModule,
    UploadModule,
    AuthModule,
    UsersModule,
    ProductsModule,
    CategoriesModule,
    CartModule,
    OrdersModule,
    ReviewsModule,
    WishlistModule,
    TryonModule,
    DesignsModule,
    InventoryModule,
    CouponsModule,
    AnalyticsModule,
    BannersModule,
    PostsModule,
    FaqModule,
    TestimonialsModule,
    ShippingModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
