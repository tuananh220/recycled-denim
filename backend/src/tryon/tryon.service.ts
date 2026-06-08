import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import Replicate from 'replicate';
import { TryOnStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';

type Provider = 'mock' | 'gradio' | 'huggingface' | 'fashn' | 'replicate';

function readEnv(key: string): string | undefined {
  const v = process.env[key]?.trim();
  if (!v || v.startsWith('your-') || v === 'replace-me') return undefined;
  return v;
}

/**
 * ESM-safe dynamic import.
 * Backend compiles to CommonJS but @gradio/client is ESM-only.
 * `(0, eval)` makes TypeScript treat the string as opaque → real import() survives.
 */
const importESM = (specifier: string): Promise<any> =>
  // eslint-disable-next-line no-eval
  (0, eval)(`import('${specifier}')`);

let _gradioClient: any = null;
async function loadGradioClient() {
  if (!_gradioClient) {
    const mod = await importESM('@gradio/client');
    _gradioClient = mod.Client;
  }
  return _gradioClient;
}

@Injectable()
export class TryonService {
  private readonly logger = new Logger(TryonService.name);

  private readonly gradioSpace = readEnv('GRADIO_TRYON_SPACE');
  private readonly hfToken     = readEnv('HF_TOKEN');
  private readonly fashnKey    = readEnv('FASHN_API_KEY');
  private readonly replicateKey = readEnv('REPLICATE_API_TOKEN');

  private readonly hasCloudinary = !!(
    readEnv('CLOUDINARY_CLOUD_NAME') &&
    readEnv('CLOUDINARY_API_KEY') &&
    readEnv('CLOUDINARY_API_SECRET')
  );

  private readonly provider: Provider = this.gradioSpace
    ? 'gradio'
    : this.hfToken
      ? 'huggingface'
      : this.fashnKey
        ? 'fashn'
        : this.replicateKey
          ? 'replicate'
          : 'mock';

  private readonly replicate = this.replicateKey
    ? new Replicate({ auth: this.replicateKey })
    : null;

  constructor(private prisma: PrismaService, private upload: UploadService) {
    this.logger.log('═══════════════════════════════════════════════════');
    this.logger.log(`  Try-on provider:   ${this.provider.toUpperCase()}`);
    this.logger.log(`  GRADIO_SPACE:      ${this.gradioSpace ?? 'NOT SET'}`);
    this.logger.log(`  HF_TOKEN:          ${this.hfToken ? `set (${this.hfToken.slice(0, 6)}…)` : 'NOT SET'}`);
    this.logger.log(`  FASHN_API_KEY:     ${this.fashnKey ? 'set' : 'NOT SET'}`);
    this.logger.log(`  REPLICATE_TOKEN:   ${this.replicateKey ? 'set' : 'NOT SET'}`);
    this.logger.log(`  Cloudinary:        ${this.hasCloudinary ? 'ON' : 'OFF'}`);
    this.logger.log(`  Build marker:      tryon.service v3-eval (${new Date().toISOString()})`);
    this.logger.log('═══════════════════════════════════════════════════');
  }

  getProviderInfo() {
    return {
      provider: this.provider,
      gradioSpace: this.gradioSpace ?? null,
      hasCloudinary: this.hasCloudinary,
      buildMarker: 'v3-eval',
      ready: true,
    };
  }

  async create(userId: string, productId: string, userImageUrl: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { images: { orderBy: { position: 'asc' }, take: 1 } },
    });
    if (!product) throw new NotFoundException('Product not found');
    const garmentUrl = product.images[0]?.url;
    if (!garmentUrl) throw new NotFoundException('Product image missing');

    let storedUser = userImageUrl;
    if (userImageUrl.startsWith('data:') && this.hasCloudinary) {
      try {
        const r = await this.upload.uploadFromUrlOrDataUri(userImageUrl, 'echove/tryon/users');
        storedUser = r.url;
      } catch (e: any) {
        this.logger.warn(`Cloudinary upload failed: ${e.message}`);
      }
    }

    const realProvider = this.provider !== 'mock';
    const canCallReal = realProvider && !storedUser.startsWith('data:');

    if (realProvider && storedUser.startsWith('data:')) {
      this.logger.warn(
        `Provider is ${this.provider} but user photo is data URI. Falling back to mock.`,
      );
    }

    const request = await this.prisma.tryOnRequest.create({
      data: {
        userId, productId,
        userImageUrl: storedUser.startsWith('data:') ? '' : storedUser,
        status: TryOnStatus.PROCESSING,
        provider: canCallReal ? this.provider : 'mock',
      },
    });

    try {
      let resultUrl: string;
      let usedProvider: Provider = 'mock';

      if (canCallReal) {
        this.logger.log(`Calling ${this.provider}…`);
        switch (this.provider) {
          case 'gradio':      resultUrl = await this.runGradio(storedUser, garmentUrl, product); break;
          case 'huggingface': resultUrl = await this.runHuggingFace(storedUser, garmentUrl); break;
          case 'fashn':       resultUrl = await this.runFashn(storedUser, garmentUrl); break;
          case 'replicate':   resultUrl = await this.runReplicate(storedUser, garmentUrl, product); break;
          default:            resultUrl = await this.runMock(garmentUrl);
        }
        usedProvider = this.provider;

        if (this.hasCloudinary) {
          const saved = await this.upload.uploadFromUrlOrDataUri(resultUrl, 'echove/tryon/results');
          resultUrl = saved.url;
        }
        this.logger.log(`✓ ${this.provider} succeeded`);
      } else {
        resultUrl = await this.runMock(garmentUrl);
      }

      return this.prisma.tryOnRequest.update({
        where: { id: request.id },
        data: { resultUrl, status: TryOnStatus.SUCCEEDED, completedAt: new Date(), provider: usedProvider },
      });
    } catch (e: any) {
      const msg = e.message?.slice(0, 500) ?? 'Unknown error';
      this.logger.error(`Try-on failed (${this.provider}): ${msg}`);
      const fallback = await this.runMock(garmentUrl).catch(() => null);
      return this.prisma.tryOnRequest.update({
        where: { id: request.id },
        data: fallback
          ? {
              resultUrl: fallback, status: TryOnStatus.SUCCEEDED, completedAt: new Date(),
              provider: 'mock', errorMessage: `[${this.provider} fallback] ${msg}`,
            }
          : { status: TryOnStatus.FAILED, errorMessage: msg, provider: this.provider },
      });
    }
  }

  // ---------------- Providers ----------------

  private async runMock(garmentUrl: string): Promise<string> {
    await new Promise((r) => setTimeout(r, 600));
    return garmentUrl;
  }

  private async runGradio(humanUrl: string, garmentUrl: string, product: any): Promise<string> {
    const Client = await loadGradioClient();

    const space = this.gradioSpace!;
    this.logger.log(`Connecting to Gradio Space: ${space}`);

    const client = await Client.connect(space, {
      hf_token: this.hfToken ? (this.hfToken as `hf_${string}`) : undefined,
    });

    const [humanRes, garmentRes] = await Promise.all([fetch(humanUrl), fetch(garmentUrl)]);
    if (!humanRes.ok)   throw new Error(`Cannot fetch user image (${humanRes.status})`);
    if (!garmentRes.ok) throw new Error(`Cannot fetch garment image (${garmentRes.status})`);
    const humanBlob   = await humanRes.blob();
    const garmentBlob = await garmentRes.blob();

    this.logger.log('Submitting to /tryon…');
    const result: any = await client.predict('/tryon', {
      dict: { background: humanBlob, layers: [], composite: null },
      garm_img: garmentBlob,
      garment_des: `${product.name} — ${product.material ?? 'recycled denim'}`,
      is_checked: true,
      is_checked_crop: false,
      denoise_steps: 30,
      seed: 42,
    });

    const data = result?.data;
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error(`Unexpected Gradio response: ${JSON.stringify(data).slice(0, 200)}`);
    }
    const output = data[0];
    const url =
      typeof output === 'string' ? output :
      output?.url ?? output?.image?.url ?? output?.path ?? null;

    if (!url) {
      throw new Error(`Gradio returned no image URL. Got: ${JSON.stringify(output).slice(0, 200)}`);
    }
    return url;
  }

  private async runHuggingFace(humanUrl: string, garmentUrl: string): Promise<string> {
    const model = readEnv('HF_TRYON_MODEL') || 'yisol/IDM-VTON';
    const endpoint = `https://api-inference.huggingface.co/models/${model}`;

    const [humanRes, garmentRes] = await Promise.all([fetch(humanUrl), fetch(garmentUrl)]);
    const humanBlob   = await humanRes.blob();
    const garmentBlob = await garmentRes.blob();

    for (let attempt = 1; attempt <= 3; attempt++) {
      const form = new FormData();
      form.append('human_image', humanBlob, 'human.jpg');
      form.append('garment_image', garmentBlob, 'garment.jpg');

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { Authorization: `Bearer ${this.hfToken}` },
        body: form,
      });
      const ct = res.headers.get('content-type') || '';
      if (res.ok && ct.startsWith('image/')) {
        const buf = Buffer.from(await res.arrayBuffer());
        return `data:${ct};base64,${buf.toString('base64')}`;
      }
      const text = await res.text();
      let parsed: any = null;
      try { parsed = JSON.parse(text); } catch {}
      if (res.status === 503 && parsed?.estimated_time) {
        const w = Math.min(60, Math.ceil(parsed.estimated_time) + 2);
        this.logger.warn(`HF model loading, waiting ${w}s…`);
        await new Promise((r) => setTimeout(r, w * 1000));
        continue;
      }
      throw new Error(`HF ${res.status}: ${parsed?.error || text.slice(0, 200)}`);
    }
    throw new Error('HF model still loading after retries');
  }

  private async runFashn(humanUrl: string, garmentUrl: string): Promise<string> {
    const res = await fetch('https://api.fashn.ai/v1/run', {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.fashnKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model_image: humanUrl, garment_image: garmentUrl, category: 'tops' }),
    });
    if (!res.ok) throw new Error(`FASHN ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const { id } = (await res.json()) as { id: string };
    for (let i = 0; i < 60; i++) {
      await new Promise((r) => setTimeout(r, 1000));
      const s = await fetch(`https://api.fashn.ai/v1/status/${id}`, {
        headers: { Authorization: `Bearer ${this.fashnKey}` },
      });
      if (!s.ok) continue;
      const d = await s.json() as { status: string; output?: string[]; error?: string };
      if (d.status === 'completed' && d.output?.[0]) return d.output[0];
      if (d.status === 'failed') throw new Error(d.error ?? 'FASHN failed');
    }
    throw new Error('FASHN timed out');
  }

  private async runReplicate(humanUrl: string, garmentUrl: string, product: any): Promise<string> {
    if (!this.replicate) throw new Error('Replicate not configured');
    const model = (readEnv('REPLICATE_TRYON_MODEL') ||
      'cuuupid/idm-vton:c871bb9b046607b680449ecbae55fd8c6d945e0a1948644bf2361b3d021d3ff4') as `${string}/${string}:${string}`;
    const output: any = await this.replicate.run(model, {
      input: {
        human_img: humanUrl, garm_img: garmentUrl,
        garment_des: `${product.name} — ${product.material}`, category: 'upper_body',
      },
    });
    return String(Array.isArray(output) ? output[0] : output);
  }

  // ---------------- Read APIs ----------------

  myHistory(userId: string) {
    return this.prisma.tryOnRequest.findMany({
      where: { userId }, orderBy: { createdAt: 'desc' },
      include: { product: { select: { id: true, name: true, slug: true } } },
    });
  }

  listAll() {
    return this.prisma.tryOnRequest.findMany({
      orderBy: { createdAt: 'desc' }, take: 100,
      include: {
        user: { select: { id: true, email: true, name: true } },
        product: { select: { id: true, name: true } },
      },
    });
  }
}
