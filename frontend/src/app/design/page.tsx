'use client';
import dynamic from 'next/dynamic';

const DesignEditor = dynamic(() => import('@/components/design-editor').then(m => m.DesignEditor), {
  ssr: false,
  loading: () => <div className="container py-24 text-center">Đang tải studio…</div>,
});

export default function DesignPage() {
  return (
    <div className="container py-12">
      <header className="mb-8 max-w-2xl">
        <p className="text-xs uppercase tracking-widest text-denim-rust">Studio Thiết kế</p>
        <h1 className="text-5xl mt-2 font-sans">Thiết kế của riêng bạn</h1>
        <p className="mt-3 text-muted-foreground">
          Kéo, thả, vẽ và thêm patch. Gửi bản nháp — designer ECHOVE sẽ refine và may tay cho bạn trong 7-10 ngày.
        </p>
      </header>
      <DesignEditor />
    </div>
  );
}
