'use client';
import { use, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { AdminShell } from '@/components/dashboard/admin-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';

const STATUSES = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];
const STATUS_VI: Record<string, string> = {
  PENDING: 'Chờ xác nhận', PAID: 'Đã thanh toán', PROCESSING: 'Đang xử lý',
  SHIPPED: 'Đang giao', DELIVERED: 'Đã giao', CANCELLED: 'Đã hủy', REFUNDED: 'Đã hoàn tiền',
};

const PAYMENT_METHOD_VI: Record<string, string> = {
  COD: 'Thanh toán khi nhận hàng',
  STRIPE: 'Stripe',
  PAYPAL: 'PayPal',
  VNPAY: 'VNPay',
};

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
      toast.success('Đã cập nhật đơn hàng'); load();
    } catch (e: any) { toast.error(e?.response?.data?.message || 'Thất bại'); }
  }

  if (!order) return <AdminShell allow={['ADMIN']} title="Đơn hàng"><div className="shimmer h-32" /></AdminShell>;

  const addr = order.shippingAddress || {};
  const isCOD = order.payments?.[0]?.provider === 'COD';
  const isPending = status === 'PENDING';
  const needsConfirmation = isCOD && isPending;

  return (
    <AdminShell allow={['ADMIN']} title={order.number} description={`Đặt ngày ${formatDate(order.createdAt)} · ${order.user?.email}`}>
      <div className="grid lg:grid-cols-[1fr_320px] gap-8">
        <div className="space-y-6">
          {needsConfirmation && (
            <div className="p-4 border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
              <div className="flex gap-3">
                <Clock className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">⏳ Chờ xác nhận đơn hàng</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Đây là đơn hàng COD (Thanh toán khi nhận). Vui lòng xác nhận đơn hàng bằng cách chuyển sang trạng thái "Đang xử lý" để tiếp tục quy trình.
                  </p>
                </div>
              </div>
            </div>
          )}

          <section className="border border-border">
            <h2 className="text-xs uppercase tracking-widest p-4 border-b border-border">Sản phẩm</h2>
            <ul className="divide-y divide-border">
              {order.items.map((i: any) => (
                <li key={i.id} className="p-4 flex justify-between text-sm">
                  <div>
                    <p className="font-medium">{i.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Size {i.size} · <span className="inline-block w-3 h-3 align-middle rounded-full border" style={{ backgroundColor: i.color }} /> · SL {i.quantity}
                    </p>
                  </div>
                  <p>{formatCurrency(Number(i.unitPrice) * i.quantity)}</p>
                </li>
              ))}
            </ul>
            <div className="p-4 border-t border-border space-y-1 text-sm">
              <Row label="Tạm tính" v={Number(order.subtotal)} />
              <Row label="Vận chuyển" v={Number(order.shipping)} />
              {Number(order.tax) > 0 && <Row label="Thuế" v={Number(order.tax)} />}
              {Number(order.discount) > 0 && <Row label={`Giảm giá${order.couponCode ? ` (${order.couponCode})` : ''}`} v={-Number(order.discount)} />}
              <div className="flex justify-between font-medium pt-2 border-t border-border">
                <span>Tổng cộng</span><span>{formatCurrency(Number(order.total))}</span>
              </div>
            </div>
          </section>

          <section className="border border-border p-4">
            <h2 className="text-xs uppercase tracking-widest mb-3">Địa chỉ giao hàng</h2>
            <p className="text-sm">{addr.fullName}</p>
            <p className="text-sm text-muted-foreground">{addr.phone}</p>
            <p className="text-sm text-muted-foreground mt-2">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
            <p className="text-sm text-muted-foreground">{addr.city} {addr.postalCode} · {addr.country}</p>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start space-y-4 border border-border p-4">
          <h2 className="text-xs uppercase tracking-widest">Quản lý</h2>

          <div className="space-y-2 text-xs bg-muted/40 p-3 rounded">
            <div className="flex items-center gap-2">
              <span className="font-medium">Phương thức:</span>
              <span className="font-semibold text-denim-rust">
                {PAYMENT_METHOD_VI[order.payments?.[0]?.provider] || order.payments?.[0]?.provider}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Trạng thái TT:</span>
              <span className={`uppercase tracking-widest font-semibold ${
                order.paymentStatus === 'SUCCEEDED' ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {order.paymentStatus === 'SUCCEEDED' ? '✓ Đã TT' : '⏳ Chờ TT'}
              </span>
            </div>
          </div>

          <div>
            <Label className="mb-1.5 block">Trạng thái đơn hàng</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{STATUS_VI[s]}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1.5 block">Mã vận đơn</Label>
            <Input value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="TRK-…" />
          </div>
          <Button className="w-full" onClick={save}>Lưu thay đổi</Button>

          {isCOD && (
            <div className="border-t border-border pt-4 text-xs space-y-2">
              <p className="font-medium">📌 Quy trình COD:</p>
              <ol className="space-y-1 text-muted-foreground list-decimal list-inside">
                <li>Xác nhận đơn → "Đang xử lý"</li>
                <li>Chuẩn bị hàng → "Đang giao"</li>
                <li>Nhân viên giao hàng</li>
                <li>Khách thanh toán khi nhận</li>
                <li>Xác nhận nhận → "Đã giao"</li>
              </ol>
            </div>
          )}
        </aside>
      </div>
    </AdminShell>
  );
}

const Row = ({ label, v }: { label: string; v: number }) => (
  <div className="flex justify-between"><span>{label}</span><span>{formatCurrency(v)}</span></div>
);
