'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AdminShell } from '@/components/dashboard/admin-shell';
import { DataTable } from '@/components/dashboard/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';

const STATUS_VI: Record<string, string> = {
  PENDING: 'Chờ XN', PAID: 'Đã TT', PROCESSING: 'Đang XL',
  SHIPPED: 'Đang giao', DELIVERED: 'Đã giao', CANCELLED: 'Hủy', REFUNDED: 'Hoàn tiền',
};
const STATUS_COLOR: Record<string, string> = {
  PENDING:    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200',
  PAID:       'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
  PROCESSING: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200',
  SHIPPED:    'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200',
  DELIVERED:  'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
  CANCELLED:  'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
  REFUNDED:   'bg-muted text-muted-foreground',
};

export default function AdminOrdersPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);

  async function load(query?: string, status?: string) {
    setLoading(true);
    try {
      const { data } = await api.get('/orders', {
        params: {
          pageSize: 50,
          q: query || undefined,
          status: status || undefined,
        },
      });
      setRows(data.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function handleSearch() {
    load(q, statusFilter);
  }

  function handleClear() {
    setQ('');
    setStatusFilter('');
    load('', '');
  }

  return (
    <AdminShell allow={['ADMIN']} title="Đơn hàng" description="Tất cả đơn hàng trên hệ thống.">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Tìm theo mã đơn hoặc email khách hàng…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            disabled={loading}
          />
          <Select value={statusFilter} onValueChange={setStatusFilter} disabled={loading}>
            <SelectTrigger className="sm:w-48">
              <SelectValue placeholder="Chọn trạng thái" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(STATUS_VI).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleSearch} disabled={loading} variant="outline">
            {loading ? 'Đang tìm…' : 'Tìm'}
          </Button>
          {(q || statusFilter) && (
            <Button onClick={handleClear} disabled={loading} variant="ghost">
              Xóa bộ lọc
            </Button>
          )}
        </div>

        {(q || statusFilter) && (
          <p className="text-sm text-muted-foreground">
            {rows.length === 0 ? 'Không tìm thấy kết quả' : `Tìm thấy ${rows.length} đơn hàng`}
          </p>
        )}
      </div>

      <DataTable
        rows={rows}
        empty="Chưa có đơn hàng nào."
        columns={[
          {
            key: 'no', header: 'Mã đơn',
            cell: (r: any) => (
              <Link href={`/dashboard/admin/orders/${r.id}`} className="font-medium hover:text-denim-rust">{r.number}</Link>
            ),
          },
          { key: 'customer', header: 'Khách hàng', cell: (r: any) => <span className="text-sm">{r.user?.email}</span> },
          { key: 'items', header: 'SP', cell: (r: any) => `${r.items.length}` },
          {
            key: 'status', header: 'Trạng thái',
            cell: (r: any) => (
              <span className={`text-xs uppercase tracking-widest px-2 py-0.5 ${STATUS_COLOR[r.status] || ''}`}>
                {STATUS_VI[r.status] || r.status}
              </span>
            ),
          },
          { key: 'date', header: 'Đặt ngày', cell: (r: any) => <span className="text-xs">{formatDate(r.createdAt)}</span> },
          { key: 'total', header: 'Tổng', className: 'text-right', cell: (r: any) => formatCurrency(Number(r.total)) },
        ]}
      />
    </AdminShell>
  );
}
