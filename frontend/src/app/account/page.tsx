'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/store/auth';

const dashboardByRole: Record<string, string> = {
  ADMIN: '/dashboard/admin',
  STAFF: '/dashboard/staff',
  DESIGNER: '/dashboard/designer',
  WAREHOUSE: '/dashboard/warehouse',
};

export default function AccountPage() {
  const { user, hydrated, fetchMe, logout } = useAuth();
  const router = useRouter();

  useEffect(() => { fetchMe(); }, [fetchMe]);
  useEffect(() => { if (hydrated && !user) router.push('/login'); }, [hydrated, user, router]);

  if (!hydrated) return <div className="container py-24 text-center text-muted-foreground">Loading…</div>;
  if (!user) return null;

  const dash = dashboardByRole[user.role];

  return (
    <div className="container py-12 max-w-3xl">
      <h1 className="text-4xl mb-2">Hi, {user.name}</h1>
      <p className="text-sm text-muted-foreground mb-8">{user.email} · <span className="uppercase tracking-widest">{user.role}</span></p>

      <div className="grid sm:grid-cols-2 gap-4">
        <AccountTile href="/orders" title="My orders" desc="Track every delivery" />
        <AccountTile href="/wishlist" title="Wishlist" desc="Saved for later" />
        <AccountTile href="/try-on" title="AI try-on history" desc="View past generations" />
        <AccountTile href="/design" title="My designs" desc="Drafts & reviews" />
        {dash && <AccountTile href={dash} title={`${user.role.toLowerCase()} dashboard`} desc="Internal tools" />}
      </div>

      <div className="mt-12">
        <Button variant="outline" onClick={() => logout().then(() => router.push('/'))}>Sign out</Button>
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
