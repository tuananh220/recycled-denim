'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Heart, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/store/cart';
import { useAuth } from '@/store/auth';
import { api } from '@/lib/api';
import { SizeGuide } from '@/components/marketing/size-guide';
import { StockUrgency } from '@/components/marketing/stock-urgency';
import { trackRecentlyViewed } from '@/hooks/use-recently-viewed';
import { formatCurrency } from '@/lib/utils';

export function ProductDetailClient({ product }: { product: any }) {
  const [size, setSize] = useState<string>(product.sizes?.[0] ?? 'Free');
  const [color, setColor] = useState<string>(product.colors?.[0] ?? '#1f3a5f');
  const [qty, setQty] = useState(1);
  const router = useRouter();
  const { add } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    trackRecentlyViewed({
      id: product.id, slug: product.slug, name: product.name,
      price: product.price, image: product.images?.[0]?.url,
      recycledPercent: product.recycledPercent,
    });
  }, [product]);

  async function onAdd() {
    if (!user) { router.push('/login'); return; }
    try {
      await add(product.id, size, color, qty);
      toast.success('Đã thêm vào giỏ', { description: `${product.name} · Size ${size}` });
    } catch (e: any) { toast.error(e?.response?.data?.message || 'Thất bại'); }
  }

  async function onWishlist() {
    if (!user) { router.push('/login'); return; }
    try {
      await api.post('/wishlist', { productId: product.id });
      toast.success('Đã lưu vào yêu thích');
    } catch { toast.error('Không lưu được'); }
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs uppercase tracking-widest">Kích cỡ</p>
          <SizeGuide />
        </div>
        <div className="flex flex-wrap gap-2">
          {product.sizes?.map((s: string) => (
            <button key={s} type="button" onClick={() => setSize(s)}
              className={`h-10 min-w-12 px-3 grid place-items-center border text-sm transition ${
                size === s ? 'border-indigo-900 bg-indigo-900 text-denim-ecru' : 'border-border hover:border-indigo-900'
              }`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs uppercase tracking-widest mb-2">Màu sắc</p>
        <div className="flex gap-2">
          {product.colors?.map((c: string) => (
            <button key={c} type="button" onClick={() => setColor(c)} aria-label={c}
              className={`h-8 w-8 rounded-full border-2 ${color === c ? 'border-indigo-900' : 'border-border'}`}
              style={{ backgroundColor: c }} />
          ))}
        </div>
      </div>

      <StockUrgency size={size} color={color} inventory={product.inventory} />

      <div className="flex items-center gap-3">
        <p className="text-xs uppercase tracking-widest">Số lượng</p>
        <div className="flex items-center border border-border">
          <button onClick={() => setQty(Math.max(1, qty - 1))} className="h-10 w-10">−</button>
          <span className="w-10 text-center">{qty}</span>
          <button onClick={() => setQty(qty + 1)} className="h-10 w-10">+</button>
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-2">
        <Button onClick={onAdd} size="lg">
          Thêm vào giỏ — {formatCurrency(Number(product.price) * qty)}
        </Button>
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={onWishlist} variant="outline" size="lg">
            <Heart className="h-4 w-4" /> Yêu thích
          </Button>
          <Button asChild variant="outline" size="lg">
            <a href={`/try-on?productId=${product.id}`}>
              <Sparkles className="h-4 w-4" /> Thử AI
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
