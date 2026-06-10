'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/store/auth';
import { formatCurrency, formatDate } from '@/lib/utils';

const STATUS_VI: Record<string, string> = {
  PENDING: 'Chờ xác nhận',
  PAID: 'Đã thanh toán',
  PROCESSING: 'Đang xử lý',
  SHIPPED: 'Đang giao',
  DELIVERED: 'Đã giao',
  CANCELLED: 'Đã hủy',
  REFUNDED: 'Đã hoàn tiền',
};

export default function OrdersPage() {
  const { user, hydrated, fetchMe } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => { fetchMe(); }, [fetchMe]);
  useEffect(() => {
    if (!hydrated) return;
    if (!user) { router.push('/login'); return; }
    api.get('/orders/mine').then(r => setOrders(r.data)).catch(() => null);
  }, [hydrated, user, router]);

  if (!hydrated) return <div className="container py-24 text-center text-muted-foreground">Đang tải…</div>;
  if (!user) return null;

  return (
    <div className="container py-12 max-w-4xl">
      <h1 className="text-4xl mb-8 font-serif">Đơn hàng của tôi</h1>
      {orders.length === 0 && (
        <p className="text-sm text-muted-foreground">Bạn chưa có đơn hàng nào.</p>
      )}
      <ul className="divide-y divide-border">
        {orders.map((o) => (
          <li key={o.id}>
            <Link href={`/orders/${o.id}`} className="py-6 grid grid-cols-4 items-center gap-4 hover:bg-muted/40 px-2">
              <div>
                <p className="font-medium">{o.number}</p>
                <p className="text-xs text-muted-foreground">{formatDate(o.createdAt)}</p>
              </div>
              <p className="text-sm">{o.items.length} sản phẩm</p>
              <p className="text-xs uppercase tracking-widest">{STATUS_VI[o.status] || o.status}</p>
              <p className="text-right font-medium">{formatCurrency(Number(o.total))}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
