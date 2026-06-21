'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/store/auth';
import { ProductCard } from '@/components/product/product-card';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export default function WishlistPage() {
  const { user, hydrated, fetchMe } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);

  const load = useCallback(async () => {
    const { data } = await api.get('/wishlist');
    setItems(data);
  }, []);

  useEffect(() => { fetchMe(); }, [fetchMe]);
  useEffect(() => {
    if (!hydrated) return;
    if (!user) { router.push('/login'); return; }
    load();
  }, [hydrated, user, router, load]);

  async function remove(productId: string) {
    await api.delete(`/wishlist/${productId}`);
    setItems((arr) => arr.filter((x) => x.productId !== productId));
    toast.success('Đã xóa');
  }

  if (!hydrated) return <div className="container py-24 text-center text-muted-foreground">Đang tải…</div>;
  if (!user) return null;

  return (
    <div className="container py-12">
      <h1 className="text-4xl mb-8 font-sans">Sản phẩm yêu thích</h1>
      {items.length === 0 && (
        <p className="text-muted-foreground">Bạn chưa lưu sản phẩm nào.</p>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
        {items.map((w) => (
          <div key={w.id} className="relative group">
            <Button variant="ghost" size="icon" onClick={() => remove(w.productId)}
              className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 bg-background/80">
              <X className="h-4 w-4" />
            </Button>
            <ProductCard
              slug={w.product.slug} name={w.product.name}
              price={w.product.price} image={w.product.images?.[0]?.url}
              recycledPercent={w.product.recycledPercent}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
