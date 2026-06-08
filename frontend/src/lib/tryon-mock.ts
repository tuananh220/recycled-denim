/**
 * Smart client-side mock for virtual try-on.
 *
 * Composites the garment image onto the user photo using HTML Canvas:
 *   - Detects approximate body region in user photo (center crop)
 *   - Removes garment background via "white→transparent" trick
 *   - Overlays with multiply blend mode for realistic shading
 *
 * Not real AI, but visually convincing for demos / portfolio.
 */

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** Remove near-white background by setting those pixels' alpha to 0. */
function removeWhiteBackground(canvas: HTMLCanvasElement, threshold = 230) {
  const ctx = canvas.getContext('2d')!;
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = data.data;
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];
    if (r > threshold && g > threshold && b > threshold) {
      pixels[i + 3] = 0; // transparent
    } else if (r > 200 && g > 200 && b > 200) {
      // soften edges
      pixels[i + 3] = Math.round((255 - Math.max(r, g, b)) * 4);
    }
  }
  ctx.putImageData(data, 0, 0);
}

export async function compositeTryOn(userImageUrl: string, garmentImageUrl: string): Promise<string> {
  const [userImg, garmentImg] = await Promise.all([
    loadImage(userImageUrl),
    loadImage(garmentImageUrl),
  ]);

  // Result canvas matches user photo
  const canvas = document.createElement('canvas');
  canvas.width = userImg.naturalWidth;
  canvas.height = userImg.naturalHeight;
  const ctx = canvas.getContext('2d')!;

  // 1) Draw user
  ctx.drawImage(userImg, 0, 0);

  // 2) Prepare garment on offscreen canvas, remove background
  const off = document.createElement('canvas');
  off.width = garmentImg.naturalWidth;
  off.height = garmentImg.naturalHeight;
  const offCtx = off.getContext('2d')!;
  offCtx.drawImage(garmentImg, 0, 0);
  removeWhiteBackground(off);

  // 3) Position garment on torso area
  // Rough heuristic: torso width ≈ 55% of photo width, vertically centered around 35-75%
  const targetWidth = canvas.width * 0.55;
  const ratio = off.width / off.height;
  const targetHeight = targetWidth / ratio;
  const x = (canvas.width - targetWidth) / 2;
  const y = canvas.height * 0.30;

  // Subtle drop shadow for depth
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.25)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 6;
  ctx.globalAlpha = 0.95;
  ctx.drawImage(off, x, y, targetWidth, targetHeight);
  ctx.restore();

  // 4) Light grain/texture overlay to unify
  ctx.fillStyle = 'rgba(31, 58, 95, 0.04)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  return canvas.toDataURL('image/jpeg', 0.9);
}
