# INDIGO REST API

Base URL: `${API}/api`  ·  Swagger UI: `/api/docs`
All non-public endpoints require `Authorization: Bearer <accessToken>`.

## Auth
| Method | Path | Auth | Body / Notes |
|---|---|---|---|
| POST | `/auth/register` | public | `{ name, email, password }` |
| POST | `/auth/login` | public | `{ email, password }` |
| POST | `/auth/refresh` | public | `{ refreshToken }` |
| POST | `/auth/verify-email` | public | `{ token }` |
| POST | `/auth/forgot-password` | public | `{ email }` |
| POST | `/auth/reset-password` | public | `{ token, password }` |
| POST | `/auth/logout` | user | clears refresh hash |
| GET  | `/auth/me` | user | returns current user |

## Products
| Method | Path | Auth |
|---|---|---|
| GET  | `/products?q&category&size&color&minPrice&maxPrice&sort&page&pageSize` | public |
| GET  | `/products/:slug` | public |
| GET  | `/products/:slug/related` | public |
| POST | `/products` | ADMIN |
| PATCH| `/products/:id` | ADMIN |
| DELETE | `/products/:id` | ADMIN (soft) |

## Categories
- `GET /categories` (public) · `POST /categories` (admin) · `DELETE /categories/:id`

## Cart (user)
- `GET /cart`
- `POST /cart/items` `{ productId, size, color, quantity }`
- `PATCH /cart/items/:id` `{ quantity }`
- `DELETE /cart/items/:id`
- `DELETE /cart` — clear

## Orders
- `POST /orders/checkout` (user) — converts cart → order
- `GET /orders/mine` (user)
- `GET /orders/:id` (user owner OR admin/staff)
- `GET /orders` (admin/staff)
- `PATCH /orders/:id/status` `{ status, trackingNumber? }` (admin/staff)

## Reviews
- `GET /reviews/product/:productId` (public)
- `POST /reviews` (user) — upserts
- `DELETE /reviews/:id` (user owner)

## Wishlist (user)
- `GET /wishlist` · `POST /wishlist {productId}` · `DELETE /wishlist/:productId`

## AI Try-on
- `POST /tryon` (user) `{ productId, userImageUrl }` — synchronous; returns final record
- `GET /tryon/mine` (user)
- `GET /tryon` (admin)

## Custom Designs
- `POST /designs` (user) — `{ title, productId?, designJson, previewUrl? }`
- `GET /designs/mine` (user)
- `PATCH /designs/:id/submit` (user)
- `GET /designs/queue` (designer/admin)
- `PATCH /designs/:id/review` (designer/admin) — `{ status, reviewerNotes, designJson? }`

## Inventory (admin/warehouse)
- `GET /inventory` · `GET /inventory/product/:productId`
- `PATCH /inventory/:id { quantity }`

## Coupons
- `GET /coupons/validate/:code` (public)
- `GET /coupons` · `POST /coupons` · `DELETE /coupons/:id` (admin)

## Analytics
- `GET /analytics/overview` (admin)

## Upload
- `GET /upload/signature` (user) — returns Cloudinary signed params for browser direct upload
