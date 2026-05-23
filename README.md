<<<<<<< HEAD
# INDIGO — Recycled Denim AI Fashion Platform

A production-ready full-stack monorepo for an AI-powered recycled denim e-commerce brand.

> **Stack**: Next.js 15 (App Router) · TypeScript · Tailwind · shadcn/ui · NestJS · Prisma · PostgreSQL (Supabase) · Cloudinary · Replicate / FASHN AI · JWT + RBAC

```
recycled-denim/
├── backend/        # NestJS API
├── frontend/       # Next.js 15 storefront + dashboards
├── packages/shared # Shared TS types between FE and BE
└── docs/           # API, deployment, architecture
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js ≥ 20
- pnpm ≥ 9 (or npm/yarn)
- PostgreSQL 15+ (or a Supabase project)
- Accounts: Cloudinary, Replicate (or FASHN AI), Resend/SMTP

### 1. Clone & install
```bash
git clone <repo>
cd recycled-denim
pnpm install      # installs FE + BE workspaces
```

### 2. Configure environment

Copy `backend/.env.example` → `backend/.env` and `frontend/.env.example` → `frontend/.env.local`.
Fill in DB, JWT, Cloudinary, Replicate, SMTP values. See [docs/ENV.md](docs/ENV.md).

### 3. Database
```bash
cd backend
pnpm prisma migrate dev --name init
pnpm prisma db seed
```

### 4. Run dev servers
```bash
# Terminal 1 — backend (http://localhost:4000)
cd backend && pnpm start:dev

# Terminal 2 — frontend (http://localhost:3000)
cd frontend && pnpm dev
```

### 5. Default seeded accounts
| Role             | Email                       | Password    |
|------------------|-----------------------------|-------------|
| Admin            | admin@indigo.dev            | Admin@123   |
| Staff            | staff@indigo.dev            | Staff@123   |
| Designer         | designer@indigo.dev         | Design@123  |
| Warehouse        | warehouse@indigo.dev        | Ware@123    |
| Customer         | customer@indigo.dev         | Cust@123    |

---

## 🧱 Features Built

### Authentication & RBAC
- Register / login with bcrypt + JWT access + refresh tokens
- Email verification & password reset flow
- 5 roles: `CUSTOMER`, `ADMIN`, `STAFF`, `DESIGNER`, `WAREHOUSE`
- `@Roles()` decorator + `RolesGuard`

### Customer
- Landing, shop, product detail, search, faceted filter, wishlist, cart, checkout
- AI virtual try-on (Replicate / FASHN AI)
- Custom design editor (Fabric.js)
- Reviews & ratings, order tracking, account dashboard

### Admin / Staff / Designer / Warehouse
- Role-based dashboards
- Product, category, user, order, inventory, coupon management
- Revenue analytics, AI request log
- Design review queue, shipping status updates

### Platform
- Cloudinary image upload (signed)
- Rate limiting, validation pipes, global error filter
- Dark/light theme, responsive, SEO metadata, loading skeletons
- OpenAPI/Swagger at `/api/docs`

---

## 📚 Documentation

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — system design
- [docs/API.md](docs/API.md) — REST reference
- [docs/ENV.md](docs/ENV.md) — environment variables
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) — Vercel + Render + Supabase
- [docs/AI.md](docs/AI.md) — virtual try-on integration

---

## 🛡 License
MIT
=======
# recycled-denim
my exe2 website
>>>>>>> 7501161c3d1a95464f7f0b456b11dddc2d150430
