'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Package, Users, Tags, Receipt, Warehouse, Image as ImgIcon,
  Ticket, Sparkles, Palette, ChevronLeft, BookOpen, HelpCircle,
} from 'lucide-react';
import { useAuth, type Role } from '@/store/auth';
import { cn } from '@/lib/utils';

interface NavItem { href: string; label: string; icon: any; roles: Role[]; }

const NAV: NavItem[] = [
  { href: '/dashboard/admin',            label: 'Tổng quan',         icon: LayoutDashboard, roles: ['ADMIN'] },
  { href: '/dashboard/admin/products',   label: 'Sản phẩm',          icon: Package,         roles: ['ADMIN'] },
  { href: '/dashboard/admin/categories', label: 'Danh mục',          icon: Tags,            roles: ['ADMIN'] },
  { href: '/dashboard/admin/orders',     label: 'Đơn hàng',          icon: Receipt,         roles: ['ADMIN'] },
  { href: '/dashboard/admin/users',      label: 'Người dùng',        icon: Users,           roles: ['ADMIN'] },
  { href: '/dashboard/admin/coupons',    label: 'Mã giảm giá',       icon: Ticket,          roles: ['ADMIN'] },
  { href: '/dashboard/admin/banners',    label: 'Banner',            icon: ImgIcon,         roles: ['ADMIN'] },
  { href: '/dashboard/admin/posts',      label: 'Bài viết',          icon: BookOpen,        roles: ['ADMIN'] },
  { href: '/dashboard/admin/faq',        label: 'FAQ',               icon: HelpCircle,      roles: ['ADMIN'] },
  { href: '/dashboard/admin/tryon',      label: 'Lịch sử AI Try-on', icon: Sparkles,        roles: ['ADMIN'] },
  { href: '/dashboard/staff',            label: 'Xử lý đơn hàng',    icon: Receipt,         roles: ['STAFF'] },
  { href: '/dashboard/designer',         label: 'Hàng chờ thiết kế', icon: Palette,         roles: ['DESIGNER'] },
  { href: '/dashboard/warehouse',        label: 'Quản lý kho',       icon: Warehouse,       roles: ['WAREHOUSE'] },
];

export function AdminShell({
  allow, title, description, actions, children,
}: {
  allow: Role[];
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { user, hydrated, fetchMe } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => { fetchMe(); }, [fetchMe]);
  useEffect(() => {
    if (!hydrated) return;
    if (!user) { router.push('/login'); return; }
    if (!allow.includes(user.role)) router.push('/account');
  }, [hydrated, user, allow, router]);

  if (!hydrated) return <div className="container py-24 text-center text-muted-foreground">Đang tải…</div>;
  if (!user || !allow.includes(user.role)) return null;

  const items = NAV.filter((n) => n.roles.includes(user.role));

  return (
    <div className="min-h-screen grid lg:grid-cols-[240px_1fr]">
      <aside className="hidden lg:block border-r border-border bg-muted/30">
        <div className="sticky top-16 p-6 space-y-6">
          <Link href="/" className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-3 w-3" /> Quay về cửa hàng
          </Link>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{user.role}</p>
            <p className="text-sm font-medium mt-1">{user.name}</p>
          </div>
          <nav className="space-y-0.5">
            {items.map((n) => {
              const active = pathname === n.href || (n.href !== '/dashboard/admin' && pathname.startsWith(n.href));
              return (
                <Link
                  key={n.href} href={n.href}
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-2 text-sm transition-colors',
                    active ? 'bg-indigo-900 text-denim-ecru' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <n.icon className="h-4 w-4" /> {n.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      <div>
        <div className="lg:hidden border-b border-border bg-muted/30 overflow-x-auto">
          <div className="flex gap-1 p-2 min-w-max">
            {items.map((n) => {
              const active = pathname === n.href;
              return (
                <Link key={n.href} href={n.href}
                  className={cn('flex items-center gap-1.5 px-3 py-1.5 text-xs whitespace-nowrap',
                    active ? 'bg-indigo-900 text-denim-ecru' : 'text-muted-foreground')}>
                  <n.icon className="h-3 w-3" /> {n.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="p-6 lg:p-10 max-w-7xl">
          <div className="flex items-start justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-sans">{title}</h1>
              {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
            </div>
            {actions && <div className="flex gap-2">{actions}</div>}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
