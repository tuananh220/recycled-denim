'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AdminShell } from '@/components/dashboard/admin-shell';
import { DataTable } from '@/components/dashboard/data-table';
import { api } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';

const STATUS_COLOR: Record<string, string> = {
  PENDING:    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200',
  PAID:       'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
  PROCESSING: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
  SHIPPED:    'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200',
  DELIVERED:  'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
  CANCELLED:  'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
  REFUNDED:   'bg-muted text-muted-foreground',
};

export default function AdminOrdersPage() {
  const [rows, setRows] = useState<any[]>([]);

  async function load() { const { data } = await api.get('/orders', { params: { pageSize: 50 } }); setRows(data.data); }
  useEffect(() => { load(); }, []);

  return (
    <AdminShell allow={['ADMIN']} title="Orders" description="All orders across the platform.">
      <DataTable
        rows={rows}
        empty="No orders yet."
        columns={[
          {
            key: 'no', header: 'Order',
            cell: (r: any) => (
              <Link href={`/dashboard/admin/orders/${r.id}`} className="font-medium hover:text-denim-rust">{r.number}</Link>
            ),
          },
          { key: 'customer', header: 'Customer', cell: (r: any) => <span className="text-sm">{r.user?.email}</span> },
          { key: 'items', header: 'Items', cell: (r: any) => `${r.items.length}` },
          {
            key: 'status', header: 'Status',
            cell: (r: any) => (
              <span className={`text-xs uppercase tracking-widest px-2 py-0.5 ${STATUS_COLOR[r.status] || ''}`}>
                {r.status}
              </span>
            ),
          },
          { key: 'date', header: 'Placed', cell: (r: any) => <span className="text-xs">{formatDate(r.createdAt)}</span> },
          { key: 'total', header: 'Total', className: 'text-right', cell: (r: any) => formatCurrency(Number(r.total)) },
        ]}
      />
    </AdminShell>
  );
}
