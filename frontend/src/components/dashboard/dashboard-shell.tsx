'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, type Role } from '@/store/auth';

export function DashboardShell({
  allow, title, children,
}: { allow: Role[]; title: string; children: React.ReactNode }) {
  const { user, hydrated, fetchMe } = useAuth();
  const router = useRouter();

  useEffect(() => { fetchMe(); }, [fetchMe]);
  useEffect(() => {
    if (!hydrated) return;
    if (!user) { router.push('/login'); return; }
    if (!allow.includes(user.role)) router.push('/account');
  }, [hydrated, user, allow, router]);

  if (!hydrated) return <div className="container py-24 text-center text-muted-foreground">Loading…</div>;
  if (!user || !allow.includes(user.role)) return null;

  return (
    <div className="container py-12">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-widest text-denim-rust">{user.role} dashboard</p>
        <h1 className="text-4xl mt-2">{title}</h1>
      </header>
      {children}
    </div>
  );
}
