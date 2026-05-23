'use client';
import dynamic from 'next/dynamic';

const DesignEditor = dynamic(() => import('@/components/design-editor').then(m => m.DesignEditor), {
  ssr: false,
  loading: () => <div className="container py-24 text-center">Loading studio…</div>,
});

export default function DesignPage() {
  return (
    <div className="container py-12">
      <header className="mb-8 max-w-2xl">
        <p className="text-xs uppercase tracking-widest text-denim-rust">Design Studio</p>
        <h1 className="text-5xl mt-2">Design your one-of-one</h1>
        <p className="mt-3 text-muted-foreground">Drag, drop, paint and patch. Submit your draft and our designers will refine it for production.</p>
      </header>
      <DesignEditor />
    </div>
  );
}
