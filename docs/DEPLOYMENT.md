# Deployment Guide

## 1 · Supabase (PostgreSQL)

1. Create a new Supabase project.
2. Project Settings → Database → **Connection string**:
   - **Pooled** (port 6543, mode `transaction`) → `DATABASE_URL`
   - **Direct** (port 5432) → `DIRECT_URL`
3. Append `?pgbouncer=true&connection_limit=1` to `DATABASE_URL` for serverless safety.

```
DATABASE_URL="postgresql://postgres.<ref>:<pw>@aws-0-xxx.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.<ref>:<pw>@aws-0-xxx.pooler.supabase.com:5432/postgres"
```

## 2 · Backend on Render

1. New → **Web Service** → connect repo, set Root to `backend`.
2. Build command:
   ```
   npm install && npx prisma generate && npm run build
   ```
3. Start command:
   ```
   npx prisma migrate deploy && npm run start:prod
   ```
4. Environment: copy everything from `backend/.env.example`.
5. Add `CORS_ORIGIN` = your Vercel URL (and `localhost:3000` for dev).
6. Health check path: `/api/docs`.
7. Auto-deploy on push to `main`.

> Alternative: use the included `backend/Dockerfile` and deploy as a **Private Service / Docker**.

## 3 · Frontend on Vercel

1. Import the repo, set the project root to `frontend`.
2. Framework preset: **Next.js**.
3. Add env vars:
   - `NEXT_PUBLIC_API_URL=https://<your-backend>.onrender.com/api`
   - `NEXT_PUBLIC_SITE_URL=https://<your-domain>`
   - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=…`
4. Deploy. Add your custom domain.

## 4 · Cloudinary

1. Create account → grab `cloud name`, `API key`, `API secret`.
2. Settings → Upload → enable **Signed** uploads only.
3. Create an upload preset named `indigo` (optional) for the design editor.

## 5 · Replicate (AI Try-On)

1. Create API token at https://replicate.com/account/api-tokens
2. Default model: `cuuupid/idm-vton` (IDM-VTON garment try-on).
3. Override with `REPLICATE_TRYON_MODEL` env var if needed.

## 6 · Migrations & seed

```bash
cd backend
pnpm prisma migrate deploy   # in production
pnpm prisma db seed          # one-time seed (optional)
```

## 7 · Post-deploy checklist

- [ ] `/api/docs` reachable on Render
- [ ] CORS_ORIGIN includes the Vercel domain
- [ ] Cloudinary signed uploads working from `/try-on`
- [ ] Replicate token valid (test from try-on page)
- [ ] SMTP credentials send a verification email
- [ ] Admin user can sign in & view `/dashboard/admin`

## 8 · Scaling tips

- Replace synchronous `/tryon` with a job queue (BullMQ + Redis) when traffic grows.
- Move image transforms to Cloudinary URLs (e.g. `f_auto,q_auto,w_800`).
- Add Stripe webhooks for payment confirmation.
- Use Vercel ISR (`revalidate`) on shop & product pages.
