'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OAuthButtons } from '@/components/auth/oauth-buttons';
import { useAuth } from '@/store/auth';

export default function RegisterPage() {
  const { register, handleSubmit } = useForm<{ name: string; email: string; password: string }>();
  const { register: signup, loading } = useAuth();
  const router = useRouter();

  async function onSubmit(v: any) {
    try {
      await signup(v.name, v.email, v.password);
      toast.success('Tạo tài khoản thành công');
      router.push('/account');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Đăng ký thất bại');
    }
  }

  return (
    <div className="container max-w-md py-16">
      <h1 className="text-4xl mb-2 font-serif">Tạo tài khoản</h1>
      <p className="text-sm text-muted-foreground mb-8">Tham gia ECHOVE — Cũ người, chất ta.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div><Label className="mb-1.5 block">Họ tên</Label><Input {...register('name', { required: true })} /></div>
        <div><Label className="mb-1.5 block">Email</Label><Input type="email" {...register('email', { required: true })} /></div>
        <div><Label className="mb-1.5 block">Mật khẩu</Label><Input type="password" {...register('password', { required: true, minLength: 8 })} /></div>
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? 'Đang tạo…' : 'Đăng ký'}
        </Button>
      </form>

      <OAuthButtons mode="register" />

      <p className="text-sm mt-6">
        Đã có tài khoản? <Link href="/login" className="underline">Đăng nhập</Link>
      </p>
    </div>
  );
}
