'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/store/auth';

/**
 * OAuth landing page — backend redirects here with tokens in URL hash:
 *   /auth/callback#accessToken=...&refreshToken=...
 *
 * We parse the hash, save tokens to localStorage, clear hash, then go to /account.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const { fetchMe } = useAuth();

  useEffect(() => {
    const hash = window.location.hash.slice(1); // remove '#'
    const params = new URLSearchParams(hash);
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');

    if (!accessToken || !refreshToken) {
      toast.error('Đăng nhập thất bại — không nhận được token');
      router.replace('/login');
      return;
    }

    localStorage.setItem('indigo.accessToken', accessToken);
    localStorage.setItem('indigo.refreshToken', refreshToken);

    // Clear hash so token doesn't stay in URL
    window.history.replaceState(null, '', '/auth/callback');

    fetchMe().then(() => {
      toast.success('Đăng nhập thành công!');
      router.replace('/account');
    });
  }, [router, fetchMe]);

  return (
    <div className="container py-32 text-center">
      <Loader2 className="h-8 w-8 animate-spin mx-auto text-denim-rust" />
      <p className="mt-4 text-sm text-muted-foreground">Đang hoàn tất đăng nhập…</p>
    </div>
  );
}
