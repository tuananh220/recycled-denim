'use client';
import { useEffect, useState } from 'react';
import { AdminShell } from '@/components/dashboard/admin-shell';
import { DataTable } from '@/components/dashboard/data-table';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { formatCurrency, formatDate } from '@/lib/utils';

const NEXT: Record<string, string> = { PENDING: 'PAID', PAID: 'PROCESSING', PROCESSING: 'SHIPPED', SHIPPED: 'DELIVERED' };

export default function StaffDashboard() {
  const [rows, setRows] = useState<any[]>([]);

  async function load() {
    const { data } = await api.get('/orders', { params: { pageSize: 50 } });
    setRows(data.data);
  }
  useEffect(() => { load(); }, []);

  async function advance(o: any) {
    const next = NEXT[o.status]; if (!next) return;
    try {
      await api.patch(`/orders/${o.id}/status`, {
        status: next,
        trackingNumber: next === 'SHIPPED' ? `TRK-${Math.random().toString(36).slice(2, 9).toUpperCase()}` : undefined,
      });
      toast.success(`Moved to ${next}`); load();
    } catch { toast.error('Failed'); }
  }

  return (
    <AdminShell allow={['STAFF', 'ADMIN']} title="Order processing" description="Move orders along the fulfillment pipeline.">
      <DataTable
        rows={rows}
        empty="No orders to process."
        columns={[
          { key: 'no', header: 'Order', cell: (r: any) => <span className="font-medium">{r.number}</span> },
          { key: 'cust', header: 'Customer', cell: (r: any) => <span className="text-sm">{r.user?.email}</span> },
          { key: 'items', header: 'Items', cell: (r: any) => `${r.items.length}` },
          { key: 'status', header: 'Status', cell: (r: any) => <span className="text-xs uppercase tracking-widest">{r.status}</span> },
          { key: 'date', header: 'Placed', cell: (r: any) => <span className="text-xs">{formatDate(r.createdAt)}</span> },
          {
            key: 'actions', header: '', className: 'text-right',
            cell: (r: any) => (
              <div className="flex items-center justify-end gap-3">
                <span className="text-sm">{formatCurrency(Number(r.total))}</span>
                {NEXT[r.status] && <Button size="sm" onClick={() => advance(r)}>→ {NEXT[r.status]}</Button>}
              </div>
            ),
          },
        ]}
      />
    </AdminShell>
  );
}
