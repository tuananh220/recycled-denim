'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/store/auth';

export default function LoginPage() {
  const { register, handleSubmit } = useForm<{ email: string; password: string }>();
  const { login, loading } = useAuth();
  const router = useRouter();

  async function onSubmit(v: { email: string; password: string }) {
    try {
      await login(v.email, v.password);
      toast.success('Welcome back');
      router.push('/account');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Login failed');
    }
  }

  return (
    <div className="container max-w-md py-24">
      <h1 className="text-4xl mb-2">Sign in</h1>
      <p className="text-sm text-muted-foreground mb-8">Welcome back to INDIGO.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div><Label className="mb-1.5 block">Email</Label><Input type="email" {...register('email', { required: true })} /></div>
        <div><Label className="mb-1.5 block">Password</Label><Input type="password" {...register('password', { required: true })} /></div>
        <Button type="submit" size="lg" className="w-full" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</Button>
      </form>

      <p className="text-sm mt-6">
        New here? <Link href="/register" className="underline">Create an account</Link>
      </p>
      <p className="text-xs text-muted-foreground mt-2">
        <Link href="/forgot-password" className="hover:text-foreground">Forgot password?</Link>
      </p>
    </div>
  );
}
