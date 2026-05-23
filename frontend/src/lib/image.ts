/**
 * Compresses an image file in the browser to a JPEG data URI.
 * Returns a base64 dataURI that's safe to POST to the backend.
 *
 * @param file source image file
 * @param maxSize longest edge in pixels (default 1024)
 * @param quality JPEG quality 0-1 (default 0.85)
 */
export async function compressImage(
  file: File,
  maxSize = 1024,
  quality = 0.85,
): Promise<string> {
  const dataUrl = await new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = dataUrl;
  });

  const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL('image/jpeg', quality);
}
