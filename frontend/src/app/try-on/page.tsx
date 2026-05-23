import { Suspense } from 'react';
import { TryOnClient } from './try-on.client';

export const metadata = { title: 'AI Try-On' };

export default function TryOnPage() {
  return (
    <Suspense fallback={<div className="container py-24 text-center text-muted-foreground">Loading studio…</div>}>
      <TryOnClient />
    </Suspense>
  );
}
