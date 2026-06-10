'use client';
import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/store/auth';
import { formatCurrency, formatDate } from '@/lib/utils';

const steps = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
const STATUS_VI: Record<string, string> = {
  PENDING: 'Chờ xác nhận',
  PAID: 'Đã thanh toán',
  PROCESSING: 'Đang xử lý',
  SHIPPED: 'Đang giao',
  DELIVERED: 'Đã giao',
};

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const router = useRouter();
  const [o, setOrder] = useState<any>(null);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    api.get(`/orders/${id}`).then(r => setOrder(r.data)).catch(() => router.push('/orders'));
  }, [id, user, router]);

  if (!o) return <div className="container py-12">Đang tải…</div>;

  const stepIdx = Math.max(0, steps.indexOf(o.status));

  return (
    <div className="container py-12 max-w-3xl">
      <h1 className="text-4xl font-serif">{o.number}</h1>
      <p className="text-sm text-muted-foreground mt-1">Đặt ngày {formatDate(o.createdAt)}</p>

      <div className="my-10">
        <div className="flex justify-between text-[10px] uppercase tracking-widest mb-2">
          {steps.map((s, i) => (
            <span key={s} className={i <= stepIdx ? 'text-indigo-900' : 'text-muted-foreground'}>
              {STATUS_VI[s]}
            </span>
          ))}
        </div>
        <div className="h-1 bg-muted relative">
          <div className="absolute top-0 left-0 h-1 bg-indigo-900" style={{ width: `${(stepIdx / (steps.length - 1)) * 100}%` }} />
        </div>
        {o.trackingNumber && (
          <p className="text-sm mt-3">Mã vận đơn: <span className="font-mono">{o.trackingNumber}</span></p>
        )}
      </div>

      <ul className="divide-y divide-border">
        {o.items.map((i: any) => (
          <li key={i.id} className="py-3 flex justify-between text-sm">
            <span>
              {i.name} × {i.quantity} (Size {i.size},{' '}
              <span className="inline-block w-3 h-3 align-middle border rounded-full" style={{ backgroundColor: i.color }} />)
            </span>
            <span>{formatCurrency(Number(i.unitPrice) * i.quantity)}</span>
          </li>
        ))}
      </ul>

      <div className="border-t border-border mt-6 pt-4 space-y-1 text-sm max-w-xs ml-auto">
        <Row label="Tạm tính" v={Number(o.subtotal)} />
        <Row label="Vận chuyển" v={Number(o.shipping)} />
        {Number(o.tax) > 0 && <Row label="Thuế" v={Number(o.tax)} />}
        {Number(o.discount) > 0 && <Row label="Giảm giá" v={-Number(o.discount)} />}
        <div className="font-medium text-base border-t border-border pt-2 flex justify-between">
          <span>Tổng cộng</span><span>{formatCurrency(Number(o.total))}</span>
        </div>
      </div>
    </div>
  );
}
const Row = ({ label, v }: { label: string; v: number }) => (
  <div className="flex justify-between"><span>{label}</span><span>{formatCurrency(v)}</span></div>
);
