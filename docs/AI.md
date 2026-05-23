# AI Integration

INDIGO uses **Replicate** (default) or **FASHN AI** to render virtual try-on images.

## Default model — IDM-VTON

`cuuupid/idm-vton:c871bb9b...`  takes:

```json
{
  "human_img": "https://res.cloudinary.com/.../user.jpg",
  "garm_img":  "https://res.cloudinary.com/.../product.jpg",
  "garment_des": "Reclaim Straight Jean — Recycled Denim",
  "category": "upper_body"
}
```

…and returns a fully rendered image URL.

## Flow inside `TryOnService.create()`

1. Validate `productId` and load primary product image.
2. If `userImageUrl` is a base64 data URI → upload to Cloudinary `indigo/tryon/users`.
3. Insert `TryOnRequest` (status: PROCESSING).
4. Call `replicate.run(model, { input })`.
5. Re-host the result on Cloudinary `indigo/tryon/results` so links don't expire.
6. Update record (`SUCCEEDED` / `FAILED`) and return.

## Switching to FASHN AI

1. Set `FASHN_API_KEY` in env.
2. Replace the Replicate block in `backend/src/tryon/tryon.service.ts`:

```ts
const res = await fetch('https://api.fashn.ai/v1/run', {
  method: 'POST',
  headers: { Authorization: `Bearer ${process.env.FASHN_API_KEY}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model_image: storedUser,
    garment_image: garmentUrl,
    category: 'tops',
  }),
});
const { output } = await res.json();
const saved = await this.upload.uploadFromUrlOrDataUri(output[0]);
resultUrl = saved.url;
```

## Production hardening (recommended)

- **Asynchronous**: convert the endpoint to enqueue a BullMQ job and return `202 + requestId`. The frontend then polls `/tryon/:id` or subscribes via WebSocket.
- **Quota**: rate-limit per user (e.g. 10/day) — extend `@nestjs/throttler` with a per-user keyer.
- **Content safety**: run a NSFW classifier on uploaded human images before submission.
- **Cache**: hash `(userImage, productImage)` → reuse prior outputs.
