# 🚀 Hướng dẫn chạy INDIGO trên localhost (từ A-Z)

> Mục tiêu: chạy được **frontend (Next.js)** + **backend (NestJS)** + **PostgreSQL** trên máy bạn trong ~15 phút.

---

## 📋 Bước 0 — Cài phần mềm cần thiết

| Phần mềm | Phiên bản | Kiểm tra |
|---|---|---|
| **Node.js** | ≥ 20 | `node -v` |
| **pnpm** | ≥ 9 | `pnpm -v` (cài: `npm i -g pnpm`) |
| **PostgreSQL** | ≥ 14 | `psql --version` |
| **Git** | bất kỳ | `git --version` |

### Cài PostgreSQL nhanh

**Windows**: tải installer https://www.postgresql.org/download/windows/
**macOS**: `brew install postgresql@16 && brew services start postgresql@16`
**Linux (Ubuntu)**: `sudo apt install postgresql && sudo systemctl start postgresql`

**Hoặc dùng Docker (khuyến nghị nếu ngại cài)**:
```bash
docker run --name indigo-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=indigo -p 5432:5432 -d postgres:16
```

---

## 📁 Bước 1 — Vào thư mục dự án & cài dependencies

```bash
cd recycled-denim
pnpm install
```

> Lệnh này sẽ tự cài cho cả `frontend`, `backend`, và `packages/shared` nhờ pnpm workspace.

Nếu lỗi `pnpm: command not found` → `npm install -g pnpm` rồi chạy lại.

---

## 🗄 Bước 2 — Chuẩn bị database

### Cách A: Postgres chạy local (port 5432)

Tạo database tên `indigo`:

```bash
# Nếu cài bằng Docker, bỏ qua bước này (DB đã được tạo sẵn)
psql -U postgres -c "CREATE DATABASE indigo;"
```

### Cách B: Dùng Supabase miễn phí (không cần cài Postgres)

1. Vào https://supabase.com → New project (free).
2. Project Settings → Database → Connection string → copy **URI** (chọn mode `Transaction`).
3. Dùng URI đó làm `DATABASE_URL` ở bước tiếp theo.

---

## 🔑 Bước 3 — Cấu hình biến môi trường

### 3.1 Backend `.env`

```bash
cp backend/.env.example backend/.env
```

Mở `backend/.env` và **bắt buộc** điền các giá trị này (các giá trị khác có thể bỏ trống lúc đầu):

```bash
# Server
NODE_ENV=development
PORT=4000
CORS_ORIGIN=http://localhost:3000

# Database — Postgres local
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/indigo?schema=public"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/indigo?schema=public"

# JWT — sinh secret bằng: openssl rand -hex 32
JWT_ACCESS_SECRET=your-very-long-random-string-32-chars-min
JWT_REFRESH_SECRET=another-very-long-random-string-32-chars
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=7d

# App URL (dùng trong email verify)
APP_URL=http://localhost:3000
```

> 💡 **Không có `openssl`?** Dùng tạm: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

#### Cấu hình tùy chọn (có thể bỏ trống để test trước)

- **Cloudinary** → nếu không có, upload ảnh sản phẩm vẫn dùng URL Unsplash từ seed.
- **Replicate (AI Try-on)** → nếu để trống, AI try-on sẽ trả về **ảnh mock** (chính là ảnh sản phẩm) — đủ để test UI flow.
- **SMTP** → nếu để trống, email verify chỉ log ra console (`[mail dry-run]`), tài khoản vẫn dùng được.

### 3.2 Frontend `.env.local`

```bash
cp frontend/.env.example frontend/.env.local
```

Mở `frontend/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
```

---

## 🌱 Bước 4 — Migrate & seed database

```bash
cd backend

# Tạo các table từ Prisma schema
pnpm prisma migrate dev --name init

# Tạo các tài khoản, sản phẩm, danh mục mẫu
pnpm prisma db seed
```

Sau bước này bạn sẽ thấy:

```
✅ Seed complete
```

> Nếu lỗi `Environment variable not found: DATABASE_URL` → kiểm tra lại file `backend/.env`.
> Nếu lỗi connect → kiểm tra `psql -U postgres -d indigo -c "SELECT 1;"`.

---

## ▶️ Bước 5 — Chạy backend và frontend

Mở **2 terminal song song**:

### Terminal 1 — Backend
```bash
cd backend
pnpm start:dev
```

Đợi đến khi thấy:
```
🚀 INDIGO API running on http://localhost:4000/api
📘 Swagger docs at http://localhost:4000/api/docs
```

### Terminal 2 — Frontend
```bash
cd frontend
pnpm dev
```

Đợi đến khi thấy:
```
▲ Next.js 15.x
- Local:   http://localhost:3000
```

---

## ✅ Bước 6 — Kiểm tra hoạt động

### 6.1 Mở trang chủ
http://localhost:3000 → phải thấy hero section với chữ "Worn. Reborn." và 3-4 sản phẩm featured.

### 6.2 Đăng nhập với tài khoản seed

Vào http://localhost:3000/login

| Vai trò | Email | Mật khẩu |
|---|---|---|
| 🛍 Customer | `customer@indigo.dev` | `Cust@123` |
| 👑 Admin | `admin@indigo.dev` | `Admin@123` |
| 📦 Staff | `staff@indigo.dev` | `Staff@123` |
| 🎨 Designer | `designer@indigo.dev` | `Design@123` |
| 🏭 Warehouse | `warehouse@indigo.dev` | `Ware@123` |

### 6.3 Test các luồng chính

| Trang | URL | Test với role |
|---|---|---|
| Shop & filter | http://localhost:3000/shop | bất kỳ |
| Product detail | http://localhost:3000/shop/reclaim-straight-jean | bất kỳ |
| Add to cart → Checkout | http://localhost:3000/cart | Customer |
| AI Try-on | http://localhost:3000/try-on | Customer (upload bất kỳ ảnh nào) |
| Design Studio | http://localhost:3000/design | Customer |
| Admin Dashboard | http://localhost:3000/dashboard/admin | Admin |
| Staff (xử lý đơn) | http://localhost:3000/dashboard/staff | Staff |
| Designer (review) | http://localhost:3000/dashboard/designer | Designer |
| Warehouse (kho) | http://localhost:3000/dashboard/warehouse | Warehouse |

### 6.4 Test API trực tiếp
Vào http://localhost:4000/api/docs → giao diện Swagger để test mọi endpoint.

---

## 🐛 Các lỗi hay gặp & cách fix

| Lỗi | Nguyên nhân | Cách fix |
|---|---|---|
| `Error: P1001 Can't reach database server` | Postgres chưa chạy | Start service Postgres / chạy lại Docker container |
| `Error: P3014` khi migrate | DB đã tồn tại với schema khác | `pnpm prisma migrate reset` (mất data) |
| Frontend báo `Network Error` khi login | Backend chưa chạy hoặc sai `NEXT_PUBLIC_API_URL` | Kiểm tra terminal backend, kiểm tra `.env.local` |
| `CORS error` | `CORS_ORIGIN` không đúng | Set `CORS_ORIGIN=http://localhost:3000` trong `backend/.env`, restart backend |
| Click "Try on" thấy ảnh giống ảnh sản phẩm | Chưa có `REPLICATE_API_TOKEN` (đang dùng mock) | Lấy token từ https://replicate.com/account/api-tokens và điền vào `.env` |
| `Module not found: Can't resolve 'fabric'` | Chưa cài deps frontend | `cd frontend && pnpm install` |
| Port 3000 hoặc 4000 đã bị chiếm | Dịch vụ khác đang chạy | Đổi port: backend `PORT=4001`, frontend `pnpm dev -p 3001` |

---

## 🎯 Lộ trình tiếp theo

Khi mọi thứ chạy ổn trên local, làm theo thứ tự:

1. ✅ **Thêm Cloudinary** → upload ảnh sản phẩm thực qua admin
2. ✅ **Thêm Replicate token** → AI try-on hoạt động thật
3. ✅ **Thêm SMTP (Resend / Gmail)** → email verify hoạt động
4. 🚀 **Deploy** theo [DEPLOYMENT.md](./DEPLOYMENT.md):
   - Database → Supabase
   - Backend → Render
   - Frontend → Vercel

---

## 💡 Tips developer

```bash
# Xem nội dung DB qua Prisma Studio (giao diện đẹp như Excel)
cd backend && pnpm prisma studio   # mở http://localhost:5555

# Reset toàn bộ DB và seed lại
cd backend && pnpm prisma migrate reset

# Build production thử trên local
cd backend && pnpm build && pnpm start:prod
cd frontend && pnpm build && pnpm start
```

Chúc bạn code vui! 🎨👖
