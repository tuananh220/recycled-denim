import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ProductDetailClient } from './product-detail.client';
import { ProductCard } from '@/components/product/product-card';
import { Badge } from '@/components/ui/badge';
import { RecentlyViewed } from '@/components/marketing/recently-viewed';
import { formatCurrency } from '@/lib/utils';

async function getProduct(slug: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${slug}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}
async function getRelated(slug: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${slug}/related`, { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getProduct(slug);
  return {
    title: p?.name ?? 'Sản phẩm',
    description: p?.description,
    openGraph: { images: p?.images?.[0]?.url ? [p.images[0].url] : [] },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [product, related] = await Promise.all([getProduct(slug), getRelated(slug)]);
  if (!product) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images?.map((i: any) => i.url),
    description: product.description,
    sku: product.id,
    brand: { '@type': 'Brand', name: 'ECHOVE' },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'VND',
      price: Number(product.price),
      availability: product.isActive ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: `${process.env.NEXT_PUBLIC_SITE_URL || ''}/shop/${product.slug}`,
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="container py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="grid grid-cols-1 gap-3">
            {product.images?.map((img: any, idx: number) => (
              <div key={img.id} className="relative aspect-[4/5] bg-muted overflow-hidden">
                <Image src={img.url} alt={img.alt || product.name} fill priority={idx === 0}
                  sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
              </div>
            ))}
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start space-y-6">
            <div className="flex gap-2">
              <Badge className="border-denim-rust text-denim-rust">{product.recycledPercent}% Tái chế</Badge>
              <Badge className="border-indigo-900 text-indigo-900 dark:border-denim-ecru dark:text-denim-ecru">1-of-1</Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-sans">{product.name}</h1>
            <div className="flex items-baseline gap-3">
              <p className="text-2xl">{formatCurrency(Number(product.price))}</p>
              {product.compareAtPrice && (
                <p className="text-lg line-through text-muted-foreground">
                  {formatCurrency(Number(product.compareAtPrice))}
                </p>
              )}
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
              {product.description}
            </p>

            <ProductDetailClient product={product} />

            <div className="border-t border-border pt-6 space-y-2 text-sm text-muted-foreground">
              <p>· Miễn phí ship cho đơn từ 500.000 VNĐ</p>
              <p>· Đổi/trả trong 14 ngày · Take-back nhận voucher 100.000₫</p>
              <p>· Chất liệu: {product.material || 'Recycled Denim'}</p>
              <p>· Sản xuất thủ công tại Atelier ECHOVE — TP.HCM</p>
            </div>
          </div>
        </div>

        <section className="mt-24">
          <h2 className="text-3xl mb-6 font-sans">Đánh giá từ khách hàng</h2>
          {product.reviews?.length === 0 ? (
            <p className="text-sm text-muted-foreground">Chưa có đánh giá nào — hãy là người đầu tiên.</p>
          ) : (
            <ul className="space-y-6">
              {product.reviews?.slice(0, 6).map((r: any) => (
                <li key={r.id} className="border-b border-border pb-4">
                  <div className="flex justify-between items-center">
                    <p className="font-medium">{r.user?.name}</p>
                    <span className="text-xs">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                  </div>
                  {r.title && <p className="text-sm font-medium mt-1">{r.title}</p>}
                  <p className="text-sm text-muted-foreground mt-1">{r.comment}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        {related?.length > 0 && (
          <section className="mt-24">
            <h2 className="text-3xl mb-8 font-sans">Có thể bạn cũng thích</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
              {related.map((p: any) => (
                <ProductCard key={p.id} slug={p.slug} name={p.name} price={p.price}
                  recycledPercent={p.recycledPercent} image={p.images?.[0]?.url} />
              ))}
            </div>
          </section>
        )}

        <RecentlyViewed excludeId={product.id} title="Sản phẩm bạn vừa xem" />

        <div className="mt-16">
          <Link href="/shop" className="text-xs uppercase tracking-widest hover:text-denim-rust">
            ← Quay lại cửa hàng
          </Link>
        </div>
      </div>
    </>
  );
}
