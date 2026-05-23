# Environment variables

## Backend (`backend/.env`)

| Key | Required | Notes |
|---|---|---|
| `NODE_ENV` | yes | `development` \| `production` |
| `PORT` | no | default 4000 |
| `CORS_ORIGIN` | yes | comma-sep list, e.g. `https://shop.indigo.dev,http://localhost:3000` |
| `DATABASE_URL` | **yes** | Supabase pooled connection (port 6543) |
| `DIRECT_URL` | **yes** | Supabase direct connection (port 5432), needed for migrations |
| `JWT_ACCESS_SECRET` | **yes** | `openssl rand -hex 32` |
| `JWT_REFRESH_SECRET` | **yes** | different from access |
| `JWT_ACCESS_TTL` | no | default `15m` |
| `JWT_REFRESH_TTL` | no | default `7d` |
| `CLOUDINARY_CLOUD_NAME` | yes | from Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | yes | |
| `CLOUDINARY_API_SECRET` | yes | |
| `REPLICATE_API_TOKEN` | yes (or FASHN) | https://replicate.com/account/api-tokens |
| `REPLICATE_TRYON_MODEL` | no | defaults to IDM-VTON |
| `FASHN_API_KEY` | optional | alternative provider |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASSWORD` | yes prod | mail server |
| `MAIL_FROM` | yes | sender address |
| `APP_URL` | yes | public site URL used in emails |

## Frontend (`frontend/.env.local`)

| Key | Notes |
|---|---|
| `NEXT_PUBLIC_API_URL` | e.g. `https://api.indigo.dev/api` |
| `NEXT_PUBLIC_SITE_URL` | the canonical site URL |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | for any client-side widgets |

> Never expose secrets prefixed with `NEXT_PUBLIC_` other than truly public values.
