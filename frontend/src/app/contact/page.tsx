'use client';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Mail, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BRAND } from '@/lib/brand';

interface FormValues { name: string; email: string; subject: string; message: string }

export default function ContactPage() {
  const { register, handleSubmit, reset, formState } = useForm<FormValues>();

  async function onSubmit(_v: FormValues) {
    // TODO: wire to backend /contact endpoint
    await new Promise((r) => setTimeout(r, 600));
    toast.success('Đã gửi tin nhắn — chúng tôi sẽ phản hồi trong 24h.');
    reset();
  }

  return (
    <div className="container py-16 grid lg:grid-cols-[1fr_360px] gap-12 max-w-5xl">
      <div>
        <p className="text-xs uppercase tracking-widest text-denim-rust">Liên hệ</p>
        <h1 className="font-sans text-5xl mt-3 mb-8">Để lại lời nhắn.</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label className="mb-1.5 block">Họ tên</Label><Input {...register('name', { required: true })} /></div>
            <div><Label className="mb-1.5 block">Email</Label><Input type="email" {...register('email', { required: true })} /></div>
          </div>
          <div><Label className="mb-1.5 block">Tiêu đề</Label><Input {...register('subject', { required: true })} /></div>
          <div><Label className="mb-1.5 block">Nội dung</Label><Textarea rows={6} {...register('message', { required: true })} /></div>
          <Button size="lg" disabled={formState.isSubmitting}>
            {formState.isSubmitting ? 'Đang gửi…' : 'Gửi tin nhắn'}
          </Button>
        </form>
      </div>

      <aside className="lg:border-l lg:border-border lg:pl-12 space-y-8">
        <ContactRow icon={Mail}   label="Email"   value={BRAND.email} />
        <ContactRow icon={Phone}  label="Điện thoại" value={BRAND.phone} />
        <ContactRow icon={MapPin} label="Atelier" value={BRAND.address} />

        <div className="pt-4 border-t border-border">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Giờ hỗ trợ</p>
          <p className="text-sm">Thứ 2 – Thứ 6 · 9h – 18h</p>
          <p className="text-sm text-muted-foreground mt-1">Phản hồi trong vòng 24 giờ.</p>
        </div>

        <div className="pt-4 border-t border-border">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Take-back</p>
          <p className="text-sm">Gửi jean cũ qua bưu điện hoặc đem trực tiếp đến Atelier.</p>
          <p className="text-sm text-muted-foreground mt-1">Nhận voucher <strong className="text-foreground">100.000 VNĐ</strong> trong 3-5 ngày.</p>
        </div>
      </aside>
    </div>
  );
}

function ContactRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <Icon className="h-5 w-5 text-denim-rust flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className="text-sm mt-1 whitespace-pre-line">{value}</p>
      </div>
    </div>
  );
}
