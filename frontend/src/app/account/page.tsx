'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/store/auth';

const dashboardByRole: Record<string, { href: string; label: string }> = {
  ADMIN:     { href: '/dashboard/admin',     label: 'Quản trị (Admin)' },
  STAFF:     { href: '/dashboard/staff',     label: 'Nhân viên (Staff)' },
  DESIGNER:  { href: '/dashboard/designer',  label: 'Designer' },
  WAREHOUSE: { href: '/dashboard/warehouse', label: 'Kho hàng' },
};

export default function AccountPage() {
  const { user, hydrated, fetchMe, logout } = useAuth();
  const router = useRouter();

  useEffect(() => { fetchMe(); }, [fetchMe]);
  useEffect(() => { if (hydrated && !user) router.push('/login'); }, [hydrated, user, router]);

  if (!hydrated) return <div className="container py-24 text-center text-muted-foreground">Đang tải…</div>;
  if (!user) return null;

  const dash = dashboardByRole[user.role];

  return (
    <div className="container py-12 max-w-3xl">
      <h1 className="text-4xl mb-2 font-serif">Xin chào, {user.name}</h1>
      <p className="text-sm text-muted-foreground mb-8">
        {user.email} · <span className="uppercase tracking-widest">{user.role}</span>
      </p>

      <div className="grid sm:grid-cols-2 gap-4">
        <AccountTile href="/orders" title="Đơn hàng của tôi" desc="Theo dõi giao hàng" />
        <AccountTile href="/wishlist" title="Yêu thích" desc="Sản phẩm đã lưu" />
        <AccountTile href="/try-on" title="Thử AI" desc="Lịch sử thử đồ ảo" />
        <AccountTile href="/design" title="Thiết kế của tôi" desc="Bản nháp & đang review" />
        {dash && <AccountTile href={dash.href} title={dash.label} desc="Công cụ nội bộ" />}
      </div>

      <div className="mt-12">
        <Button variant="outline" onClick={() => logout().then(() => router.push('/'))}>
          Đăng xuất
        </Button>
      </div>
    </div>
  );
}

function AccountTile({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link href={href} className="border border-border p-6 hover:border-indigo-900 transition-colors block">
      <p className="text-xs uppercase tracking-widest text-denim-rust">{title}</p>
      <p className="mt-2 text-sm">{desc}</p>
    </Link>
  );
}
