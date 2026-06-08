import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EMPTY_STUB = path.resolve(__dirname, 'src/lib/empty-module.js');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.huggingface.co' },
      { protocol: 'https', hostname: '*.replicate.delivery' },
      { protocol: 'https', hostname: '*.fashn.ai' },
    ],
  },

  // Turbopack config (Next.js 16 default bundler).
  // Fabric.js v5 imports jsdom → canvas (Node-only). Alias to empty stub.
  turbopack: {
    resolveAlias: {
      canvas: EMPTY_STUB,
      encoding: EMPTY_STUB,
    },
  },

  // Mirror for webpack (used by `next build` and `next dev --webpack`).
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
      encoding: false,
    };
    return config;
  },
};

export default nextConfig;
