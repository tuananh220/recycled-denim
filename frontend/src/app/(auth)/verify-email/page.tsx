'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const token = searchParams.get('token');
  const isEmailChange = searchParams.get('isEmailChange') === 'true';

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setError('Missing verification token');
        setLoading(false);
        return;
      }

      try {
        const response = await api.post('/auth/verify-email', { token });
        toast.success('Email verified successfully!');

        setTimeout(() => {
          if (isEmailChange) {
            router.push('/account/security');
          } else {
            router.push('/account');
          }
        }, 2000);
      } catch (err: any) {
        const message = err?.response?.data?.message || 'Email verification failed';
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [token, isEmailChange, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          {loading ? (
            <>
              <div className="flex justify-center mb-4">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-300 border-t-indigo-600"></div>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Verifying Email</h1>
              <p className="text-slate-600">Please wait while we verify your email address...</p>
            </>
          ) : error ? (
            <>
              <div className="mb-4 text-red-600">
                <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Verification Failed</h1>
              <p className="text-slate-600 mb-6">{error}</p>
              <Button onClick={() => router.push('/login')} className="w-full">
                Back to Login
              </Button>
            </>
          ) : (
            <>
              <div className="mb-4 text-green-600">
                <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Email Verified!</h1>
              <p className="text-slate-600 mb-6">Your email has been verified successfully. Redirecting...</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
