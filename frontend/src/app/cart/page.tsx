'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2 } from 'lucide-react';
import { useCart } from '@/store/cart';
import { useAuth } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { FreeShippingBar } from '@/components/marketing/free-shipping-bar';

export default function CartPage() {
  const { items, fetch, update, remove, subtotal } = useCart();
  const { user, hydrated, fetchMe } = useAuth();

  useEffect(() => { fetchMe(); }, [fetchMe]);
  useEffect(() => { if (user) fetch(); }, [user, fetch]);

  if (!hydrated) return <div className="container py-24 text-center text-muted-foreground">Đang tải…</div>;

  if (!user) {
    return (
      <div className="container py-24 text-center">
        <h1 className="text-4xl mb-4 font-serif">Vui lòng đăng nhập</h1>
        <p className="text-muted-foreground mb-6">Đăng nhập để xem giỏ hàng của bạn.</p>
        <Button asChild><Link href="/login">Đăng nhập</Link></Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container py-24 text-center">
        <h1 className="text-4xl mb-4 font-serif">Giỏ hàng trống</h1>
        <p className="text-muted-foreground mb-6">Khám phá các sản phẩm 1-of-1 của ECHOVE.</p>
        <Button asChild><Link href="/shop">Bắt đầu mua sắm</Link></Button>
      </div>
    );
  }

  const total = subtotal();
  const SHIPPING_FREE_THRESHOLD = 500_000;
  const shipping = total >= SHIPPING_FREE_THRESHOLD ? 0 : 30_000;

  return (
    <div className="container py-12 grid lg:grid-cols-[1fr_360px] gap-12">
      <div>
        <h1 className="text-4xl mb-6 font-serif">Giỏ hàng của bạn</h1>

        <div className="mb-6">
          <FreeShippingBar subtotal={total} />
        </div>

        <ul className="divide-y divide-border">
          {items.map((i) => (
            <li key={i.id} className="py-6 flex gap-4">
              <div className="relative w-24 h-32 bg-muted flex-shrink-0">
                <Image src={i.product.images?.[0]?.url || '/placeholder.png'} alt={i.product.name} fill className="object-cover" sizes="96px" />
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <Link href={`/shop/${i.product.slug}`} className="font-medium hover:text-denim-rust">{i.product.name}</Link>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">
                    Size {i.size} · <span className="inline-block w-3 h-3 align-middle rounded-full border" style={{ backgroundColor: i.color }} />
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center border border-border">
                    <button onClick={() => update(i.id, i.quantity - 1)} className="h-9 w-9">−</button>
                    <span className="w-8 text-center text-sm">{i.quantity}</span>
                    <button onClick={() => update(i.id, i.quantity + 1)} className="h-9 w-9">+</button>
                  </div>
                  <p className="font-medium">{formatCurrency(Number(i.product.price) * i.quantity)}</p>
                </div>
              </div>
              <button onClick={() => remove(i.id)} aria-label="Xóa" className="text-muted-foreground hover:text-red-500">
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start border border-border p-6 space-y-4">
        <h2 className="text-xs uppercase tracking-widest">Tóm tắt</h2>
        <Row label="Tạm tính" value={formatCurrency(total)} />
        <Row label="Vận chuyển" value={shipping === 0 ? 'Miễn phí' : formatCurrency(shipping)} />
        <div className="border-t border-border pt-4">
          <Row label="Tổng cộng" value={formatCurrency(total + shipping)} bold />
        </div>
        <Button asChild size="lg" className="w-full"><Link href="/checkout">Thanh toán</Link></Button>
      </aside>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between text-sm ${bold ? 'font-medium text-base' : ''}`}>
      <span>{label}</span><span>{value}</span>
    </div>
  );
}
