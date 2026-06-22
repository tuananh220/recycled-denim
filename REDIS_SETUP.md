# Redis Setup Instructions for Render

## Step 1: Add Redis Add-on to Render

1. Go to your Render dashboard
2. Select your service (backend)
3. Click "Environment" tab
4. Click "Add Environment Variable"
5. Or better: Add Redis database from Render marketplace

## Step 2: Install Dependencies

```bash
cd backend
pnpm add @nestjs/cache-manager cache-manager cache-manager-redis-store
```

## Step 3: Add Environment Variables to Render

Add these to your Render environment:
- `REDIS_HOST` - Your Redis host (e.g., redis-xxx.render.com)
- `REDIS_PORT` - Usually 6379
- `REDIS_PASSWORD` - Your Redis password

## Step 4: How to Use Cache

The CacheService is already injected globally. Use it in any service:

```typescript
import { CacheService } from '../cache/cache.service';

@Injectable()
export class ProductsService {
  constructor(private cache: CacheService) {}

  async getBySlug(slug: string) {
    return this.cache.wrap(
      `product:${slug}`,
      () => this.prisma.product.findUnique({ where: { slug } }),
      30 * 60 * 1000, // 30 min TTL
    );
  }
}
```

## Cache Keys Convention
- `product:${slug}` - Product detail
- `products:list:${page}:${category}` - Product listing
- `categories:all` - All categories
- `featured:products` - Featured products

## Invalidation

Clear cache when data changes:

```typescript
async create(dto: CreateProductDto) {
  const product = await this.prisma.product.create({...});
  await this.cache.del('products:list:*'); // Clear all product lists
  return product;
}
```

## Local Development

To test without Redis, the cache will use in-memory cache by default if Redis is not available (fallback mode).
