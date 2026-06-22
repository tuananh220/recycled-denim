'use client';
import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/store/auth';
import { formatCurrency, formatDate } from '@/lib/utils';

const steps = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
const stepsNoPayment = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED']; // COD flow
const STATUS_VI: Record<string, string> = {
  PENDING: 'Chờ xác nhận',
  PAID: 'Đã thanh toán',
  PROCESSING: 'Đang xử lý',
  SHIPPED: 'Đang giao',
  DELIVERED: 'Đã giao',
  CANCELLED: 'Đã hủy',
  REFUNDED: 'Đã hoàn tiền',
};

const PAYMENT_METHOD_VI: Record<string, string> = {
  COD: 'Thanh toán khi nhận hàng',
  STRIPE: 'Stripe',
  PAYPAL: 'PayPal',
  VNPAY: 'VNPay',
};

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const router = useRouter();
  const [o, setOrder] = useState<any>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    api.get(`/orders/${id}`).then(r => setOrder(r.data)).catch(() => router.push('/orders'));
  }, [id, user, router]);

  if (!o) return <div className="container py-12 text-center text-muted-foreground">Đang tải…</div>;

  const isCOD = o.payments?.[0]?.provider === 'COD';
  const currentSteps = isCOD ? stepsNoPayment : steps;
  const stepIdx = Math.max(0, currentSteps.indexOf(o.status));
  const isPending = o.status === 'PENDING';

  const handleCancel = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) return;
    setCancelling(true);
    try {
      await api.post(`/orders/${id}/cancel`);
      toast.success('Hủy đơn hàng thành công.');
      api.get(`/orders/${id}`).then(r => setOrder(r.data));
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Không thể hủy đơn hàng');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="container py-12 max-w-3xl">
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-4xl font-sans">{o.number}</h1>
          <p className="text-sm text-muted-foreground mt-1">Đặt ngày {formatDate(o.createdAt)}</p>
        </div>
        <div className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
          o.status === 'PENDING' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
          o.status === 'PAID' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
          o.status === 'PROCESSING' ? 'bg-sky-50 text-sky-700 border border-sky-200' :
          o.status === 'SHIPPED' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
          o.status === 'DELIVERED' ? 'bg-green-50 text-green-700 border border-green-200' :
          o.status === 'CANCELLED' ? 'bg-red-50 text-red-700 border border-red-200' :
          'bg-gray-50 text-gray-700 border border-gray-200'
        }`}>
          {STATUS_VI[o.status] || o.status}
        </div>
      </div>

      {/* COD Pending Alert */}
      {isCOD && isPending && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-6 flex gap-3">
          <Clock className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-900">⏳ Đơn hàng đang được xác nhận</p>
            <p className="text-blue-700 mt-1">Cửa hàng sẽ xác nhận đơn hàng trong thời gian sớm nhất. Bạn sẽ nhận được email hoặc SMS khi có cập nhật.</p>
          </div>
        </div>
      )}

      {o.status === 'CANCELLED' && (
        <div className="bg-red-50 text-red-800 border border-red-200 rounded-lg p-4 my-8 text-sm">
          Đơn hàng này đã bị hủy.
        </div>
      )}

      {o.status === 'REFUNDED' && (
        <div className="bg-amber-50 text-amber-800 border border-amber-200 rounded-lg p-4 my-8 text-sm">
          Đơn hàng này đã được hoàn tiền.
        </div>
      )}

      {/* Progress Tracker */}
      {!['CANCELLED', 'REFUNDED'].includes(o.status) && (
        <div className="my-10">
          <div className="flex justify-between text-[10px] uppercase tracking-widest mb-2">
            {currentSteps.map((s, i) => (
              <span key={s} className={i <= stepIdx ? 'text-indigo-900 font-semibold' : 'text-muted-foreground'}>
                {STATUS_VI[s]}
              </span>
            ))}
          </div>
          <div className="h-1 bg-muted relative">
            <div className="absolute top-0 left-0 h-1 bg-indigo-900 transition-all duration-500" style={{ width: `${(stepIdx / (currentSteps.length - 1)) * 100}%` }} />
          </div>
          {o.trackingNumber && (
            <p className="text-sm mt-3">Mã vận đơn: <span className="font-mono">{o.trackingNumber}</span></p>
          )}
        </div>
      )}

      {/* Payment Info Section */}
      <div className="bg-muted/40 p-4 rounded-lg my-6 text-sm space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Phương thức thanh toán:</span>
          <span className="font-medium">{PAYMENT_METHOD_VI[o.payments?.[0]?.provider] || o.payments?.[0]?.provider}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Trạng thái thanh toán:</span>
          <span className={`font-medium ${
            o.paymentStatus === 'SUCCEEDED' ? 'text-green-600' :
            isCOD && o.status === 'DELIVERED' ? 'text-yellow-600' :
            isCOD ? 'text-orange-600' : 'text-yellow-600'
          }`}>
            {o.paymentStatus === 'SUCCEEDED' ? '✓ Đã thanh toán' :
             isCOD && o.status === 'DELIVERED' ? '⏳ Chờ thanh toán khi nhận hàng' :
             isCOD ? '⏳ Thanh toán khi nhận hàng' : '⏳ Chờ thanh toán'}
          </span>
        </div>
      </div>

      {/* Products List */}
      <ul className="divide-y divide-border">
        {o.items.map((i: any) => (
          <li key={i.id} className="py-4 flex justify-between text-sm">
            <span>
              <span className="font-medium text-foreground">{i.name}</span> × {i.quantity} (Size {i.size},{' '}
              <span className="inline-block w-3 h-3 align-middle border rounded-full" style={{ backgroundColor: i.color }} />)
            </span>
            <span className="font-medium">{formatCurrency(Number(i.unitPrice) * i.quantity)}</span>
          </li>
        ))}
      </ul>

      {/* Summary */}
      <div className="border-t border-border mt-6 pt-4 space-y-1.5 text-sm max-w-xs ml-auto">
        <Row label="Tạm tính" v={Number(o.subtotal)} />
        <Row label="Vận chuyển" v={Number(o.shipping)} />
        {Number(o.tax) > 0 && <Row label="Thuế" v={Number(o.tax)} />}
        {Number(o.discount) > 0 && <Row label="Giảm giá" v={-Number(o.discount)} />}
        <div className="font-medium text-base border-t border-border pt-3 flex justify-between text-indigo-950">
          <span>Tổng cộng</span><span className="text-lg font-bold">{formatCurrency(Number(o.total))}</span>
        </div>
      </div>

      {/* COD Info Guide */}
      {isCOD && (
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm space-y-2">
          <p className="font-medium text-blue-900">📌 Thông tin COD (Thanh toán khi nhận)</p>
          <ol className="list-decimal list-inside space-y-1 text-blue-800">
            <li>Cửa hàng xác nhận đơn hàng</li>
            <li>Chuẩn bị hàng và giao vận đơn</li>
            <li>Nhân viên giao hàng liên hệ bạn</li>
            <li>Bạn thanh toán khi nhận hàng</li>
            <li>Xác nhận nhận hàng (nếu cần)</li>
          </ol>
        </div>
      )}

      {/* Cancel Button */}
      {o.status === 'PENDING' && (
        <div className="mt-8 border-t border-border pt-6 flex justify-end">
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="px-5 py-2.5 text-sm font-medium text-red-600 border border-red-200 rounded-md hover:bg-red-50 hover:border-red-300 transition-all focus:outline-none disabled:opacity-50"
          >
            {cancelling ? 'Đang hủy…' : 'Hủy đơn hàng'}
          </button>
        </div>
      )}
    </div>
  );
}

const Row = ({ label, v }: { label: string; v: number }) => (
  <div className="flex justify-between text-muted-foreground"><span>{label}</span><span className="text-foreground">{formatCurrency(v)}</span></div>
);
