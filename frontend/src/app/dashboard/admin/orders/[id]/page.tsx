'use client';
import { use, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AdminShell } from '@/components/dashboard/admin-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';

const STATUSES = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];

export default function AdminOrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<any>(null);
  const [status, setStatus] = useState<string>('');
  const [tracking, setTracking] = useState<string>('');

  async function load() {
    const { data } = await api.get(`/orders/${id}`);
    setOrder(data);
    setStatus(data.status);
    setTracking(data.trackingNumber || '');
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  async function save() {
    try {
      await api.patch(`/orders/${id}/status`, { status, trackingNumber: tracking || undefined });
      toast.success('Order updated'); load();
    } catch (e: any) { toast.error(e?.response?.data?.message || 'Failed'); }
  }

  if (!order) return <AdminShell allow={['ADMIN']} title="Order"><div className="shimmer h-32" /></AdminShell>;

  const addr = order.shippingAddress || {};

  return (
    <AdminShell allow={['ADMIN']} title={order.number} description={`Placed ${formatDate(order.createdAt)} · ${order.user?.email}`}>
      <div className="grid lg:grid-cols-[1fr_320px] gap-8">
        <div className="space-y-6">
          {/* Items */}
          <section className="border border-border">
            <h2 className="text-xs uppercase tracking-widest p-4 border-b border-border">Items</h2>
            <ul className="divide-y divide-border">
              {order.items.map((i: any) => (
                <li key={i.id} className="p-4 flex justify-between text-sm">
                  <div>
                    <p className="font-medium">{i.name}</p>
                    <p className="text-xs text-muted-foreground">Size {i.size} · <span className="inline-block w-3 h-3 align-middle rounded-full border" style={{ backgroundColor: i.color }} /> · qty {i.quantity}</p>
                  </div>
                  <p>{formatCurrency(Number(i.unitPrice) * i.quantity)}</p>
                </li>
              ))}
            </ul>
            <div className="p-4 border-t border-border space-y-1 text-sm">
              <Row label="Subtotal" v={Number(order.subtotal)} />
              <Row label="Shipping" v={Number(order.shipping)} />
              <Row label="Tax" v={Number(order.tax)} />
              {Number(order.discount) > 0 && <Row label={`Discount${order.couponCode ? ` (${order.couponCode})` : ''}`} v={-Number(order.discount)} />}
              <div className="flex justify-between font-medium pt-2 border-t border-border"><span>Total</span><span>{formatCurrency(Number(order.total))}</span></div>
            </div>
          </section>

          {/* Shipping address */}
          <section className="border border-border p-4">
            <h2 className="text-xs uppercase tracking-widest mb-3">Shipping address</h2>
            <p className="text-sm">{addr.fullName}</p>
            <p className="text-sm text-muted-foreground">{addr.phone}</p>
            <p className="text-sm text-muted-foreground mt-2">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
            <p className="text-sm text-muted-foreground">{addr.city} {addr.postalCode} · {addr.country}</p>
          </section>
        </div>

        {/* Actions */}
        <aside className="lg:sticky lg:top-24 lg:self-start space-y-4 border border-border p-4">
          <h2 className="text-xs uppercase tracking-widest">Manage</h2>
          <div>
            <Label className="mb-1.5 block">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1.5 block">Tracking #</Label>
            <Input value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="TRK-…" />
          </div>
          <Button className="w-full" onClick={save}>Save changes</Button>

          <div className="border-t border-border pt-4 text-xs space-y-1 text-muted-foreground">
            <p>Payment: <span className="uppercase tracking-widest">{order.paymentStatus}</span></p>
            <p>Payments logged: {order.payments?.length ?? 0}</p>
          </div>
        </aside>
      </div>
    </AdminShell>
  );
}

const Row = ({ label, v }: { label: string; v: number }) => (
  <div className="flex justify-between"><span>{label}</span><span>{formatCurrency(v)}</span></div>
);
