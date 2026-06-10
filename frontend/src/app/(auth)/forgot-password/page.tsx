'use client';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';

export default function ForgotPasswordPage() {
  const { register, handleSubmit, formState } = useForm<{ email: string }>();

  async function onSubmit(v: { email: string }) {
    try {
      await api.post('/auth/forgot-password', v);
      toast.success('Vui lòng kiểm tra email của bạn.');
    } catch {
      toast.error('Không gửi được email. Vui lòng thử lại.');
    }
  }

  return (
    <div className="container max-w-md py-24">
      <h1 className="text-4xl mb-2 font-serif">Quên mật khẩu</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Nhập email — chúng tôi sẽ gửi link đặt lại mật khẩu trong vài phút.
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label className="mb-1.5 block">Email</Label>
          <Input type="email" {...register('email', { required: true })} />
        </div>
        <Button size="lg" className="w-full" disabled={formState.isSubmitting}>
          Gửi link đặt lại
        </Button>
      </form>
    </div>
  );
}
