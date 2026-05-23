'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/store/auth';

export default function RegisterPage() {
  const { register, handleSubmit } = useForm<{ name: string; email: string; password: string }>();
  const { register: signup, loading } = useAuth();
  const router = useRouter();

  async function onSubmit(v: any) {
    try {
      await signup(v.name, v.email, v.password);
      toast.success('Account created');
      router.push('/account');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Sign up failed');
    }
  }

  return (
    <div className="container max-w-md py-24">
      <h1 className="text-4xl mb-2">Create account</h1>
      <p className="text-sm text-muted-foreground mb-8">Join the reborn movement.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div><Label className="mb-1.5 block">Name</Label><Input {...register('name', { required: true })} /></div>
        <div><Label className="mb-1.5 block">Email</Label><Input type="email" {...register('email', { required: true })} /></div>
        <div><Label className="mb-1.5 block">Password</Label><Input type="password" {...register('password', { required: true, minLength: 8 })} /></div>
        <Button type="submit" size="lg" className="w-full" disabled={loading}>{loading ? 'Creating…' : 'Create account'}</Button>
      </form>

      <p className="text-sm mt-6">Already a member? <Link href="/login" className="underline">Sign in</Link></p>
    </div>
  );
}
