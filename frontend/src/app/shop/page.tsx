import Link from 'next/link';
import { ProductCard, ProductCardSkeleton } from '@/components/product/product-card';

interface SearchParams {
  q?: string; category?: string; size?: string; color?: string;
  minPrice?: string; maxPrice?: string; sort?: string; page?: string;
}

async function fetchProducts(sp: SearchParams) {
  const params = new URLSearchParams();
  Object.entries(sp).forEach(([k, v]) => v && params.set(k, v));
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?${params}`, { cache: 'no-store' });
    if (!res.ok) return { data: [], meta: { total: 0, page: 1, totalPages: 1 } };
    return res.json();
  } catch { return { data: [], meta: { total: 0, page: 1, totalPages: 1 } }; }
}

async function fetchCategories() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

export const metadata = { title: 'Cửa hàng' };

export default async function ShopPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const [products, categories] = await Promise.all([fetchProducts(sp), fetchCategories()]);

  return (
    <div className="container py-12">
      <header className="mb-12">
        <p className="text-xs uppercase tracking-widest text-denim-rust">Bộ sưu tập</p>
        <h1 className="text-5xl mt-2 font-serif">Tất cả sản phẩm</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {products.meta?.total ?? 0} sản phẩm — mỗi cái là 1-of-1, không có cái thứ hai.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-10">
        <aside className="space-y-8 text-sm">
          <FilterGroup title="Danh mục">
            <Link href="/shop" className={!sp.category ? 'font-medium' : 'text-muted-foreground'}>
              Tất cả
            </Link>
            {categories.map((c: any) => (
              <Link key={c.id} href={`/shop?category=${c.slug}`}
                className={sp.category === c.slug ? 'font-medium' : 'text-muted-foreground'}>
                {c.name}
              </Link>
            ))}
          </FilterGroup>

          <FilterGroup title="Sắp xếp">
            {[
              ['Mới nhất', ''],
              ['Giá thấp → cao', 'price_asc'],
              ['Giá cao → thấp', 'price_desc'],
            ].map(([label, val]) => {
              const params = new URLSearchParams(sp as any);
              if (val) params.set('sort', val); else params.delete('sort');
              return (
                <Link key={label} href={`/shop?${params}`}
                  className={(sp.sort || '') === val ? 'font-medium' : 'text-muted-foreground'}>
                  {label}
                </Link>
              );
            })}
          </FilterGroup>

          <FilterGroup title="Kích cỡ">
            <div className="flex flex-wrap gap-2">
              {['XS', 'S', 'M', 'L', 'XL', 'Free'].map(s => {
                const params = new URLSearchParams(sp as any);
                params.set('size', s);
                const active = sp.size === s;
                return (
                  <Link key={s} href={`/shop?${params}`}
                    className={`h-9 px-2 grid place-items-center border text-xs ${active ? 'bg-indigo-900 text-denim-ecru border-indigo-900' : 'border-border'}`}>
                    {s}
                  </Link>
                );
              })}
            </div>
          </FilterGroup>
        </aside>

        <section className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-12">
          {products.data?.length === 0 && (
            <div className="col-span-full text-center py-24 text-muted-foreground text-sm">
              Chưa có sản phẩm nào. Quay lại sớm nhé!
            </div>
          )}
          {products.data?.map((p: any) => (
            <ProductCard
              key={p.id} slug={p.slug} name={p.name}
              price={p.price} compareAtPrice={p.compareAtPrice}
              recycledPercent={p.recycledPercent}
              image={p.images?.[0]?.url}
            />
          ))}
        </section>
      </div>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest mb-3">{title}</p>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}
