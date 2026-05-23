# Architecture

```
┌──────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Next.js 15  │ ──▶ │   NestJS API     │ ──▶ │ Supabase PG     │
│  (Vercel)    │     │   (Render)       │     │                 │
└──────────────┘     └──────────────────┘     └─────────────────┘
       │                     │
       │                     ├──▶ Cloudinary  (images, try-on uploads, results)
       │                     ├──▶ Replicate / FASHN AI  (virtual try-on)
       │                     └──▶ SMTP / Resend  (auth emails)
       │
       └──▶ Browser  (Fabric.js editor, AI try-on UI, dark mode)
```

## Backend modules

```
src/
├── auth/         JWT (access+refresh) · register · verify · reset
├── users/        profile · admin user mgmt
├── products/     catalog · search · filter · pagination
├── categories/
├── cart/         per-user cart
├── orders/       checkout · status workflow · admin/staff list
├── reviews/
├── wishlist/
├── tryon/        Replicate integration · stores user + result images
├── designs/      Fabric.js JSON · designer review queue
├── inventory/    warehouse stock control
├── coupons/      validation · admin CRUD
├── analytics/    revenue, counts, recent orders
├── upload/       Cloudinary signature endpoint
├── mail/         nodemailer service
├── prisma/       PrismaService (Global)
└── common/       guards (JWT, Roles), decorators (@Public, @Roles, @CurrentUser), filters
```

Auth & RBAC are **global** via `APP_GUARD`:
1. `JwtAuthGuard` runs on every request (skips when `@Public()`).
2. `RolesGuard` then enforces `@Roles(...)` metadata if present.

## Frontend structure

```
src/
├── app/
│   ├── (auth)/{login,register,forgot-password}
│   ├── shop/                   # listing + filters
│   ├── shop/[slug]/            # PDP + ProductDetailClient (cart, wishlist, try-on link)
│   ├── try-on/                 # AI try-on UI
│   ├── design/                 # Fabric.js editor (dynamic, ssr:false)
│   ├── cart/  checkout/  orders/  wishlist/  account/
│   └── dashboard/{admin,staff,designer,warehouse}/
├── components/{ui,layout,product,dashboard,…}
├── store/{auth,cart}.ts        # zustand
├── lib/{api,utils}.ts          # axios + token refresh
└── styles/globals.css          # Tailwind + denim palette tokens
```

## Data flow — AI try-on

```
[Browser] FileReader → base64 data URI
   │
   │  POST /api/tryon { productId, userImageUrl: dataUri }
   ▼
[NestJS] TryOnService
   ├─ Cloudinary upload(user image)            → user_image_url
   ├─ Replicate.run(IDM-VTON, { human, garm }) → output url
   ├─ Cloudinary upload(output) for permanence → result_url
   └─ Persist TryOnRequest{ status: SUCCEEDED }
```

## Security

- bcrypt(10) password hashes; refresh tokens stored as bcrypt hash too.
- `helmet`, global `ValidationPipe({ whitelist, forbidNonWhitelisted })`.
- `@nestjs/throttler` 100 req/min default.
- `class-validator` DTOs on every controller.
- `RolesGuard` enforces RBAC; `@Public()` opts-out.
- Cloudinary uploads are **signed** server-side; the frontend never holds the API secret.
