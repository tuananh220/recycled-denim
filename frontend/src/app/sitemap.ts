import type { MetadataRoute } from 'next';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function safeFetch<T>(url: string, fallback: T): Promise<T> {
  try {
    const r = await fetch(url, { cache: 'no-store' });
    if (!r.ok) return fallback;
    return r.json();
  } catch { return fallback; }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages = [
    '', '/shop', '/about', '/stories', '/lookbook', '/faq', '/contact', '/try-on', '/design',
  ].map((p) => ({
    url: `${SITE}${p}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: p === '' ? 1 : 0.7,
  }));

  const products = await safeFetch<{ data: any[] }>(`${API}/products?pageSize=500`, { data: [] });
  const productUrls = products.data.map((p) => ({
    url: `${SITE}/shop/${p.slug}`,
    lastModified: new Date(p.updatedAt ?? now),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const posts = await safeFetch<any[]>(`${API}/posts`, []);
  const postUrls = posts.map((p) => ({
    url: `${SITE}/stories/${p.slug}`,
    lastModified: new Date(p.updatedAt ?? now),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...productUrls, ...postUrls];
}
