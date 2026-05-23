'use client';
import { useEffect, useState } from 'react';
import { AdminShell } from '@/components/dashboard/admin-shell';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';

export default function DesignerDashboard() {
  const [items, setItems] = useState<any[]>([]);

  async function load() { const { data } = await api.get('/designs/queue'); setItems(data); }
  useEffect(() => { load(); }, []);

  async function review(id: string, status: 'APPROVED' | 'REJECTED') {
    const notes = prompt('Reviewer notes (optional)') || '';
    try { await api.patch(`/designs/${id}/review`, { status, reviewerNotes: notes }); toast.success(status); load(); }
    catch { toast.error('Failed'); }
  }

  return (
    <AdminShell allow={['DESIGNER', 'ADMIN']} title="Design review queue" description="Approve or refine customer-submitted designs.">
      {items.length === 0
        ? <div className="border border-border p-12 text-center text-sm text-muted-foreground">Queue is clear — nice work.</div>
        : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((d) => (
              <article key={d.id} className="border border-border">
                {d.previewUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={d.previewUrl} alt={d.title} className="w-full aspect-[4/5] object-cover" />
                )}
                <div className="p-4 space-y-2">
                  <p className="font-medium">{d.title}</p>
                  <p className="text-xs text-muted-foreground">{d.user?.email} · {formatDate(d.createdAt)}</p>
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" onClick={() => review(d.id, 'APPROVED')}>Approve</Button>
                    <Button size="sm" variant="outline" onClick={() => review(d.id, 'REJECTED')}>Reject</Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
    </AdminShell>
  );
}
