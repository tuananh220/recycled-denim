import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import Replicate from 'replicate';
import { TryOnStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class TryonService {
  private readonly logger = new Logger(TryonService.name);

  private hasReplicate = !!process.env.REPLICATE_API_TOKEN;
  private hasCloudinary = !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );

  private replicate = this.hasReplicate
    ? new Replicate({ auth: process.env.REPLICATE_API_TOKEN })
    : null;

  constructor(private prisma: PrismaService, private upload: UploadService) {
    this.logger.log(
      `Try-on init — Replicate: ${this.hasReplicate ? 'ON' : 'MOCK'} · Cloudinary: ${this.hasCloudinary ? 'ON' : 'OFF'}`,
    );
  }

  async create(userId: string, productId: string, userImageUrl: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { images: { orderBy: { position: 'asc' }, take: 1 } },
    });
    if (!product) throw new NotFoundException('Product not found');
    const garmentUrl = product.images[0]?.url;
    if (!garmentUrl) throw new NotFoundException('Product image missing');

    // 1) Try to persist user image to Cloudinary (only if configured)
    let storedUser = userImageUrl;
    if (userImageUrl.startsWith('data:') && this.hasCloudinary) {
      try {
        const r = await this.upload.uploadFromUrlOrDataUri(userImageUrl, 'indigo/tryon/users');
        storedUser = r.url;
      } catch (e: any) {
        this.logger.warn(`Cloudinary upload failed, keeping data URI: ${e.message}`);
      }
    }

    // 2) If using real Replicate, we MUST have a public URL (data URI won't work)
    if (this.hasReplicate && storedUser.startsWith('data:')) {
      throw new BadRequestException(
        'Replicate requires a publicly accessible image URL. Please configure Cloudinary (CLOUDINARY_* env vars) or disable Replicate to use mock mode.',
      );
    }

    const request = await this.prisma.tryOnRequest.create({
      data: {
        userId,
        productId,
        userImageUrl: storedUser.startsWith('data:') ? '' : storedUser, // don't store huge data URIs
        status: TryOnStatus.PROCESSING,
        provider: this.hasReplicate ? 'replicate' : 'mock',
      },
    });

    try {
      let resultUrl: string;

      if (this.replicate) {
        // ===== REAL AI =====
        const model = (process.env.REPLICATE_TRYON_MODEL ||
          'cuuupid/idm-vton:c871bb9b046607b680449ecbae55fd8c6d945e0a1948644bf2361b3d021d3ff4') as `${string}/${string}:${string}`;
        const output: any = await this.replicate.run(model, {
          input: {
            human_img: storedUser,
            garm_img: garmentUrl,
            garment_des: `${product.name} — ${product.material}`,
            category: 'upper_body',
          },
        });
        const remote = Array.isArray(output) ? output[0] : output;
        if (this.hasCloudinary) {
          const saved = await this.upload.uploadFromUrlOrDataUri(String(remote), 'indigo/tryon/results');
          resultUrl = saved.url;
        } else {
          resultUrl = String(remote);
        }
      } else {
        // ===== MOCK MODE =====
        // Just return the product image so the UI flow can be tested end-to-end.
        await new Promise((r) => setTimeout(r, 1200)); // simulate latency
        resultUrl = garmentUrl;
      }

      return this.prisma.tryOnRequest.update({
        where: { id: request.id },
        data: { resultUrl, status: TryOnStatus.SUCCEEDED, completedAt: new Date() },
      });
    } catch (e: any) {
      this.logger.error(`Try-on failed: ${e.message}`, e.stack);
      return this.prisma.tryOnRequest.update({
        where: { id: request.id },
        data: { status: TryOnStatus.FAILED, errorMessage: e.message?.slice(0, 500) },
      });
    }
  }

  myHistory(userId: string) {
    return this.prisma.tryOnRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { product: { select: { id: true, name: true, slug: true } } },
    });
  }

  listAll() {
    return this.prisma.tryOnRequest.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        user: { select: { id: true, email: true, name: true } },
        product: { select: { id: true, name: true } },
      },
    });
  }
}
