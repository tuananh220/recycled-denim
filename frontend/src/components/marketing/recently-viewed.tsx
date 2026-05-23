'use client';
import { useRecentlyViewed } from '@/hooks/use-recently-viewed';
import { ProductCard } from '@/components/product/product-card';

export function RecentlyViewed({ excludeId, title = 'Recently viewed' }: { excludeId?: string; title?: string }) {
  const items = useRecentlyViewed(excludeId);
  if (items.length === 0) return null;

  return (
    <section className="container py-16">
      <h2 className="text-3xl mb-8">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-8">
        {items.slice(0, 6).map((p) => (
          <ProductCard
            key={p.id}
            slug={p.slug}
            name={p.name}
            price={p.price}
            image={p.image}
            recycledPercent={p.recycledPercent ?? 80}
          />
        ))}
      </div>
    </section>
  );
}
