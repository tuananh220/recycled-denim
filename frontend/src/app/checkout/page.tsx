'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCart } from '@/store/cart';
import { useAuth } from '@/store/auth';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

interface FormValues {
  fullName: string; phone: string; line1: string; line2?: string;
  city: string; postalCode: string; country: string;
  paymentProvider: 'STRIPE' | 'PAYPAL' | 'COD';
  couponCode?: string;
}

export default function CheckoutPage() {
  const { user, hydrated, fetchMe } = useAuth();
  const { items, fetch, subtotal, clear } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { register, handleSubmit } = useForm<FormValues>({
    defaultValues: { country: 'US', paymentProvider: 'COD' },
  });

  useEffect(() => { fetchMe(); }, [fetchMe]);
  useEffect(() => {
    if (!hydrated) return;
    if (!user) { router.push('/login'); return; }
    fetch();
  }, [hydrated, user, router, fetch]);

  const sub = subtotal();
  const shipping = sub > 200 ? 0 : 12;
  const tax = +(sub * 0.08).toFixed(2);
  const total = sub + shipping + tax;

  async function onSubmit(v: FormValues) {
    setSubmitting(true);
    try {
      const { data } = await api.post('/orders/checkout', {
        paymentProvider: v.paymentProvider,
        couponCode: v.couponCode || undefined,
        shippingAddress: {
          fullName: v.fullName, phone: v.phone, line1: v.line1, line2: v.line2,
          city: v.city, postalCode: v.postalCode, country: v.country,
        },
      });
      await clear();
      toast.success('Order placed!');
      router.push(`/orders/${data.id}`);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Checkout failed');
    } finally { setSubmitting(false); }
  }

  if (!hydrated) return <div className="container py-24 text-center text-muted-foreground">Loading…</div>;
  if (!user || items.length === 0) return null;

  return (
    <div className="container py-12 grid lg:grid-cols-[1fr_400px] gap-12">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <h1 className="text-4xl">Checkout</h1>

        <section>
          <h2 className="text-xs uppercase tracking-widest mb-4">Shipping</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Full name"><Input {...register('fullName', { required: true })} /></Field>
            <Field label="Phone"><Input {...register('phone', { required: true })} /></Field>
            <Field label="Address line 1" className="sm:col-span-2"><Input {...register('line1', { required: true })} /></Field>
            <Field label="Address line 2" className="sm:col-span-2"><Input {...register('line2')} /></Field>
            <Field label="City"><Input {...register('city', { required: true })} /></Field>
            <Field label="Postal code"><Input {...register('postalCode', { required: true })} /></Field>
            <Field label="Country"><Input {...register('country', { required: true })} /></Field>
          </div>
        </section>

        <section>
          <h2 className="text-xs uppercase tracking-widest mb-4">Payment</h2>
          <div className="flex gap-3 flex-wrap">
            {(['COD', 'STRIPE', 'PAYPAL'] as const).map((p) => (
              <label key={p} className="border border-border px-4 py-3 cursor-pointer has-[:checked]:bg-indigo-900 has-[:checked]:text-denim-ecru">
                <input type="radio" value={p} {...register('paymentProvider')} className="hidden" />
                {p === 'COD' ? 'Cash on delivery' : p}
              </label>
            ))}
          </div>
        </section>

        <section>
          <Field label="Coupon code (optional)"><Input {...register('couponCode')} /></Field>
        </section>

        <Button size="lg" disabled={submitting}>{submitting ? 'Placing order…' : `Place order — ${formatCurrency(total)}`}</Button>
      </form>

      <aside className="lg:sticky lg:top-24 lg:self-start border border-border p-6 space-y-3">
        <h2 className="text-xs uppercase tracking-widest mb-2">Your bag</h2>
        <ul className="space-y-2 text-sm">
          {items.map((i) => (
            <li key={i.id} className="flex justify-between">
              <span className="truncate pr-2">{i.product.name} × {i.quantity}</span>
              <span>{formatCurrency(Number(i.product.price) * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="border-t border-border pt-3 text-sm space-y-1">
          <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(sub)}</span></div>
          <div className="flex justify-between"><span>Shipping</span><span>{shipping ? formatCurrency(shipping) : 'Free'}</span></div>
          <div className="flex justify-between"><span>Tax</span><span>{formatCurrency(tax)}</span></div>
          <div className="flex justify-between font-medium text-base pt-2 border-t border-border"><span>Total</span><span>{formatCurrency(total)}</span></div>
        </div>
      </aside>
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block">{label}</Label>
      {children}
    </div>
  );
}
