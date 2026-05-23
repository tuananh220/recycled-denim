import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UploadService } from './upload.service';

@ApiTags('upload')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('upload')
export class UploadController {
  constructor(private upload: UploadService) {}

  /** Returns Cloudinary signature for direct browser uploads */
  @Get('signature')
  signature() { return this.upload.signParams(); }

  /**
   * Server-side upload — accepts a base64 data URI or remote URL.
   * Falls back to a development-mode echo when Cloudinary is not configured,
   * so admins can still test the UI without keys.
   */
  @Roles(Role.ADMIN, Role.DESIGNER, Role.STAFF)
  @Post('image')
  async image(@Body() body: { data: string; folder?: string }) {
    const hasCloudinary = !!(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    );

    if (!hasCloudinary) {
      // Dev fallback — just echo the data URI back so the FE can still display it.
      // (Won't be persisted across restarts but is good enough for UI testing.)
      return { url: body.data, mock: true };
    }
    const r = await this.upload.uploadFromUrlOrDataUri(body.data, body.folder ?? 'indigo/admin');
    return { url: r.url, publicId: r.publicId };
  }
}
