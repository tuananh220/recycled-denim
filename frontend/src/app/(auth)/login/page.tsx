'use client';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OAuthButtons } from '@/components/auth/oauth-buttons';
import { useAuth } from '@/store/auth';

function LoginInner() {
  const { register, handleSubmit } = useForm<{ email: string; password: string }>();
  const { login, loading } = useAuth();
  const router = useRouter();
  const sp = useSearchParams();

  // Show error if OAuth callback redirected back here with ?error=...
  useEffect(() => {
    const err = sp.get('error');
    if (err) toast.error(decodeURIComponent(err));
  }, [sp]);

  async function onSubmit(v: { email: string; password: string }) {
    try {
      await login(v.email, v.password);
      toast.success('Chào mừng trở lại');
      router.push('/account');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Đăng nhập thất bại');
    }
  }

  return (
    <div className="container max-w-md py-16">
      <h1 className="text-4xl mb-2 font-sans">Đăng nhập</h1>
      <p className="text-sm text-muted-foreground mb-8">Chào mừng quay lại ECHOVE.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div><Label className="mb-1.5 block">Email</Label><Input type="email" {...register('email', { required: true })} /></div>
        <div><Label className="mb-1.5 block">Mật khẩu</Label><Input type="password" {...register('password', { required: true })} /></div>
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? 'Đang đăng nhập…' : 'Đăng nhập'}
        </Button>
      </form>

      <OAuthButtons mode="login" />

      <p className="text-sm mt-6">
        Chưa có tài khoản? <Link href="/register" className="underline">Đăng ký ngay</Link>
      </p>
      <p className="text-xs text-muted-foreground mt-2">
        <Link href="/forgot-password" className="hover:text-foreground">Quên mật khẩu?</Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="container py-24 text-center text-muted-foreground">Loading…</div>}>
      <LoginInner />
    </Suspense>
  );
}
