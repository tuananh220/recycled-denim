'use client';

import { Suspense } from 'react';
import VerifyEmailForm from './form';

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
      <VerifyEmailForm />
    </Suspense>
  );
}

