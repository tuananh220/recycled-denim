'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/store/auth';
import { formatCurrency, formatDate } from '@/lib/utils';

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

  if (!hydrated) return <div className="container py-24 text-center text-muted-foreground">Loading…</div>;
  if (!user) return null;

  return (
    <div className="container py-12 max-w-4xl">
      <h1 className="text-4xl mb-8">My orders</h1>
      {orders.length === 0 && <p className="text-sm text-muted-foreground">No orders yet.</p>}
      <ul className="divide-y divide-border">
        {orders.map((o) => (
          <li key={o.id}>
            <Link href={`/orders/${o.id}`} className="py-6 grid grid-cols-4 items-center gap-4 hover:bg-muted/40 px-2">
              <div>
                <p className="font-medium">{o.number}</p>
                <p className="text-xs text-muted-foreground">{formatDate(o.createdAt)}</p>
              </div>
              <p className="text-sm">{o.items.length} item(s)</p>
              <p className="text-xs uppercase tracking-widest">{o.status}</p>
              <p className="text-right font-medium">{formatCurrency(Number(o.total))}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
