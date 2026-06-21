'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Banknote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCart } from '@/store/cart';
import { useAuth } from '@/store/auth';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { isValidVNPhone } from '@/lib/vn-address';
import { VNAddressSelector, type VNAddress } from '@/components/forms/vn-address-selector';

interface FormValues {
  fullName: string;
  phone: string;
  line1: string;
  couponCode?: string;
  notes?: string;
}

export default function CheckoutPage() {
  const { user, hydrated, fetchMe } = useAuth();
  const { items, fetch, subtotal, clear } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [address, setAddress] = useState<VNAddress>({});
  const [shipping, setShipping] = useState<{ fee: number; leadTimeDays: number } | null>(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, watch } = useForm<FormValues>();
  const phone = watch('phone');

  useEffect(() => { fetchMe(); }, [fetchMe]);
  useEffect(() => {
    if (!hydrated) return;
    if (!user) { router.push('/login'); return; }
    fetch();
  }, [hydrated, user, router, fetch]);

  const sub = subtotal();

  // Auto calculate shipping when district selected
  useEffect(() => {
    if (!address.districtCode) { setShipping(null); return; }
    setShippingLoading(true);
    api.post('/shipping/calculate', {
      provinceCode: address.provinceCode,
      districtCode: address.districtCode,
      wardCode: address.wardCode ? String(address.wardCode) : undefined,
      weight: items.reduce((s, i) => s + i.quantity * 500, 500),
      totalValue: sub,
    })
      .then(r => setShipping({ fee: r.data.fee, leadTimeDays: r.data.leadTimeDays }))
      .catch(() => setShipping({ fee: 30_000, leadTimeDays: 5 }))
      .finally(() => setShippingLoading(false));
  }, [address.districtCode, address.wardCode, address.provinceCode, sub, items]);

  const shippingFee = shipping?.fee ?? 0;
  const total = sub + shippingFee;

  async function onSubmit(v: FormValues) {
    if (!isValidVNPhone(v.phone)) {
      toast.error('Số điện thoại không hợp lệ. Vui lòng nhập số VN 10 chữ số.');
      return;
    }
    if (!address.province || !address.district || !address.ward) {
      toast.error('Vui lòng chọn đầy đủ Tỉnh / Quận / Phường.');
      return;
    }

    setSubmitting(true);
    try {
      const { data: order } = await api.post('/orders/checkout', {
        paymentProvider: 'COD',
        couponCode: v.couponCode || undefined,
        notes: v.notes || undefined,
        shippingAddress: {
          fullName: v.fullName, phone: v.phone, line1: v.line1,
          ward: address.ward, district: address.district,
          city: address.province, postalCode: '00000', country: 'Vietnam',
        },
      });

      await clear();
      toast.success('Đặt hàng thành công! Chúng tôi sẽ liên hệ xác nhận sớm.');
      router.push(`/orders/${order.id}`);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Đặt hàng thất bại');
    } finally {
      setSubmitting(false);
    }
  }

  if (!hydrated) return <div className="container py-24 text-center text-muted-foreground">Đang tải…</div>;
  if (!user || items.length === 0) return null;

  const phoneValid = !phone || isValidVNPhone(phone);

  return (
    <div className="container py-12 grid lg:grid-cols-[1fr_400px] gap-12">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <h1 className="text-4xl font-sans">Thanh toán</h1>

        <section>
          <h2 className="text-xs uppercase tracking-widest mb-4">Thông tin giao hàng</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <Field label="Họ và tên"><Input {...register('fullName', { required: true })} /></Field>
            <Field label="Số điện thoại">
              <Input {...register('phone', { required: true })} placeholder="0901 234 567" />
              {phone && !phoneValid && (
                <p className="text-xs text-red-500 mt-1">Số điện thoại không hợp lệ</p>
              )}
            </Field>
          </div>

          <VNAddressSelector value={address} onChange={setAddress} />

          <div className="mt-4">
            <Label className="mb-1.5 block">Địa chỉ cụ thể (số nhà, tên đường)</Label>
            <Input {...register('line1', { required: true })} placeholder="123 Trần Hưng Đạo" />
          </div>

          <div className="mt-4">
            <Label className="mb-1.5 block">Ghi chú (tùy chọn)</Label>
            <Textarea rows={2} {...register('notes')} placeholder="Yêu cầu gói quà, giờ giao..." />
          </div>
        </section>

        <section>
          <h2 className="text-xs uppercase tracking-widest mb-4">Phương thức thanh toán</h2>
          <div className="border border-indigo-900 bg-muted/40 p-5 flex items-start gap-4">
            <Banknote className="h-6 w-6 text-denim-rust flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">Thanh toán khi nhận hàng (COD)</p>
              <p className="text-sm text-muted-foreground mt-1">
                Trả tiền mặt cho shipper khi nhận hàng. Vui lòng kiểm tra hàng trước khi thanh toán.
              </p>
              <p className="text-xs text-muted-foreground mt-3">
                💡 Sản phẩm 1-of-1 đã chuẩn bị sẵn — chúng tôi sẽ gọi xác nhận trong vòng 2 giờ.
              </p>
            </div>
          </div>
        </section>

        <section>
          <Field label="Mã giảm giá (tùy chọn)">
            <Input {...register('couponCode')} placeholder="CHAO10 / TAISINH" />
          </Field>
        </section>

        <Button size="lg" disabled={submitting || !shipping}>
          {submitting ? 'Đang xử lý…' : `Đặt hàng — ${formatCurrency(total)}`}
        </Button>

        <p className="text-xs text-muted-foreground">
          Bằng việc đặt hàng, bạn đồng ý với{' '}
          <a href="/faq" className="underline hover:text-foreground">Chính sách đổi trả</a> của ECHOVE.
        </p>
      </form>

      <aside className="lg:sticky lg:top-24 lg:self-start border border-border p-6 space-y-3 h-fit">
        <h2 className="text-xs uppercase tracking-widest mb-2">Đơn hàng của bạn</h2>
        <ul className="space-y-2 text-sm">
          {items.map((i) => (
            <li key={i.id} className="flex justify-between">
              <span className="truncate pr-2">{i.product.name} × {i.quantity}</span>
              <span>{formatCurrency(Number(i.product.price) * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="border-t border-border pt-3 text-sm space-y-1">
          <div className="flex justify-between"><span>Tạm tính</span><span>{formatCurrency(sub)}</span></div>
          <div className="flex justify-between">
            <span>Vận chuyển</span>
            <span>
              {shippingLoading ? '…' :
               !address.districtCode ? <span className="text-muted-foreground">Chọn địa chỉ</span> :
               shippingFee === 0 ? 'Miễn phí' : formatCurrency(shippingFee)}
            </span>
          </div>
          {shipping && shippingFee > 0 && (
            <p className="text-xs text-muted-foreground">Giao trong {shipping.leadTimeDays} ngày</p>
          )}
          <div className="flex justify-between font-medium text-base pt-2 border-t border-border">
            <span>Tổng cộng</span><span>{formatCurrency(total)}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-1.5 block">{label}</Label>
      {children}
    </div>
  );
}
