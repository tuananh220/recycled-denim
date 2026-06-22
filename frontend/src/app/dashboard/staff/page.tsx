'use client';
import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { AdminShell } from '@/components/dashboard/admin-shell';
import { DataTable } from '@/components/dashboard/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { formatCurrency, formatDate } from '@/lib/utils';

const STATUS_VI: Record<string, string> = {
  PENDING: 'Chờ XN',
  PAID: 'Đã TT',
  PROCESSING: 'Đang XL',
  SHIPPED: 'Đang giao',
  DELIVERED: 'Đã giao',
  CANCELLED: 'Đã hủy',
  REFUNDED: 'Hoàn tiền',
};

const STATUS_COLOR: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200',
  PAID: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
  PROCESSING: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200',
  SHIPPED: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200',
  DELIVERED: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
  REFUNDED: 'bg-muted text-muted-foreground',
};

export default function StaffDashboard() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({ open: false, order: null as any, nextStatus: '' });

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

  function getNextStatus(order: any): string | null {
    const isCOD = order.payments?.[0]?.provider === 'COD';
    const currentStatus = order.status;

    if (isCOD) {
      const codNext: Record<string, string> = {
        PENDING: 'PROCESSING',
        PROCESSING: 'SHIPPED',
        SHIPPED: 'DELIVERED',
      };
      return codNext[currentStatus] || null;
    } else {
      const otherNext: Record<string, string> = {
        PENDING: 'PAID',
        PAID: 'PROCESSING',
        PROCESSING: 'SHIPPED',
        SHIPPED: 'DELIVERED',
      };
      return otherNext[currentStatus] || null;
    }
  }

  function handleAdvance(o: any) {
    const next = getNextStatus(o);
    if (!next) return;
    setConfirmDialog({ open: true, order: o, nextStatus: next });
  }

  async function confirmAdvance() {
    if (!confirmDialog.order) return;

    const next = confirmDialog.nextStatus;
    setConfirmDialog({ open: false, order: null, nextStatus: '' });

    try {
      const trackingNumber = next === 'SHIPPED' ? `TRK-${Math.random().toString(36).slice(2, 9).toUpperCase()}` : undefined;
      await api.patch(`/orders/${confirmDialog.order.id}/status`, {
        status: next,
        trackingNumber,
      });
      toast.success(`✓ Chuyển → ${STATUS_VI[next]}`);
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Thất bại');
    }
  }

  return (
    <AdminShell
      allow={['STAFF', 'ADMIN']}
      title="Xử lý Đơn Hàng"
      description="Quản lý đơn hàng theo pipeline fulfillment. Chuyển trạng thái từng bước."
    >
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
            key: 'no',
            header: 'Mã Đơn',
            cell: (r: any) => <span className="font-medium">{r.number}</span>,
          },
          {
            key: 'cust',
            header: 'Khách Hàng',
            cell: (r: any) => <span className="text-sm">{r.user?.email}</span>,
          },
          {
            key: 'items',
            header: 'SP',
            cell: (r: any) => `${r.items.length}`,
          },
          {
            key: 'status',
            header: 'Trạng thái',
            cell: (r: any) => (
              <span className={`text-xs uppercase tracking-widest px-2 py-0.5 rounded ${STATUS_COLOR[r.status] || ''}`}>
                {STATUS_VI[r.status] || r.status}
              </span>
            ),
          },
          {
            key: 'payment',
            header: 'TT',
            cell: (r: any) => (
              <span className="text-xs font-medium">
                {r.payments?.[0]?.provider === 'COD' ? 'COD' : 'Online'}
              </span>
            ),
          },
          {
            key: 'date',
            header: 'Ngày Đặt',
            cell: (r: any) => <span className="text-xs">{formatDate(r.createdAt)}</span>,
          },
          {
            key: 'actions',
            header: '',
            className: 'text-right w-40',
            cell: (r: any) => {
              const next = getNextStatus(r);
              return (
                <div className="flex items-center justify-end gap-3">
                  <span className="text-sm font-medium">{formatCurrency(Number(r.total))}</span>
                  {next && (
                    <Button
                      size="sm"
                      onClick={() => handleAdvance(r)}
                      disabled={loading}
                      className="whitespace-nowrap"
                    >
                      → {STATUS_VI[next]}
                    </Button>
                  )}
                </div>
              );
            },
          },
        ]}
      />

      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Xác nhận chuyển trạng thái
            </DialogTitle>
            <DialogDescription>
              Bạn muốn chuyển đơn <strong>{confirmDialog.order?.number}</strong> từ <strong>{STATUS_VI[confirmDialog.order?.status]}</strong> sang <strong>{STATUS_VI[confirmDialog.nextStatus]}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmDialog({ open: false, order: null, nextStatus: '' })}>
              Hủy
            </Button>
            <Button onClick={confirmAdvance}>Xác nhận</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}
