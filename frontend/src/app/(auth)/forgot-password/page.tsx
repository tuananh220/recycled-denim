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
    try { await api.post('/auth/forgot-password', v); toast.success('Check your inbox.'); }
    catch { toast.error('Could not send email.'); }
  }
  return (
    <div className="container max-w-md py-24">
      <h1 className="text-4xl mb-2">Reset password</h1>
      <p className="text-sm text-muted-foreground mb-8">We&apos;ll email you a reset link.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div><Label className="mb-1.5 block">Email</Label><Input type="email" {...register('email', { required: true })} /></div>
        <Button size="lg" className="w-full" disabled={formState.isSubmitting}>Send link</Button>
      </form>
    </div>
  );
}
