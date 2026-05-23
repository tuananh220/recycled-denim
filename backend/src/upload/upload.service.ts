import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class UploadService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key:    process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  /** Upload a remote URL or base64 dataURI directly to Cloudinary. */
  async uploadFromUrlOrDataUri(input: string, folder = 'indigo') {
    const res = await cloudinary.uploader.upload(input, { folder, resource_type: 'image' });
    return { url: res.secure_url, publicId: res.public_id, width: res.width, height: res.height };
  }

  /** Issue a signed upload signature for direct browser uploads. */
  signParams(folder = 'indigo/uploads') {
    const timestamp = Math.round(Date.now() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      { folder, timestamp },
      process.env.CLOUDINARY_API_SECRET as string,
    );
    return {
      timestamp, signature, folder,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    };
  }
}
