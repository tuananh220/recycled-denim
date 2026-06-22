'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { AdminShell } from '@/components/dashboard/admin-shell';
import { DataTable } from '@/components/dashboard/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function AdminProductsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string; name: string }>({ open: false, id: '', name: '' });
  const [deleting, setDeleting] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get('/products/admin/all', { params: { pageSize: 50, q: q || undefined } });
      setRows(data.data);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  async function softDelete() {
    if (!deleteDialog.id) return;
    setDeleting(true);
    try {
      await api.delete(`/products/${deleteDialog.id}`);
      toast.success('Đã ẩn sản phẩm');
      setDeleteDialog({ open: false, id: '', name: '' });
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Thất bại');
    } finally {
      setDeleting(false);
    }
  }

  async function hardDelete() {
    if (!deleteDialog.id) return;
    setDeleting(true);
    try {
      await api.delete(`/products/${deleteDialog.id}/permanent`);
      toast.success('Đã xóa sản phẩm vĩnh viễn');
      setDeleteDialog({ open: false, id: '', name: '' });
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Thất bại. Sản phẩm này có thể có đơn hàng liên quan.');
    } finally {
      setDeleting(false);
    }
  }

  const openDeleteDialog = (id: string, name: string) => {
    setDeleteDialog({ open: true, id, name });
  };

  return (
    <AdminShell
      allow={['ADMIN']}
      title="Sản phẩm"
      description="Quản lý danh mục sản phẩm — tạo, sửa, ẩn."
      actions={<Button asChild><Link href="/dashboard/admin/products/new"><Plus className="h-4 w-4" /> Sản phẩm mới</Link></Button>}
    >
      <div className="flex gap-2 mb-4">
        <Input placeholder="Tìm theo tên hoặc slug…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-sm" />
        <Button variant="outline" onClick={load} disabled={loading}>Tìm</Button>
      </div>

      <DataTable
        rows={rows}
        empty="Chưa có sản phẩm nào."
        columns={[
          {
            key: 'thumb', header: '', className: 'w-16',
            cell: (r: any) => r.images?.[0]?.url
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={r.images[0].url} alt="" className="w-12 h-12 object-cover" />
              : <div className="w-12 h-12 bg-muted" />,
          },
          {
            key: 'name', header: 'Sản phẩm',
            cell: (r: any) => (
              <div>
                <Link href={`/shop/${r.slug}`} className="font-medium hover:text-denim-rust">{r.name}</Link>
                <p className="text-xs text-muted-foreground">/{r.slug}</p>
              </div>
            ),
          },
          { key: 'cat',   header: 'Danh mục', cell: (r: any) => r.category?.name },
          { key: 'price', header: 'Giá',      cell: (r: any) => formatCurrency(Number(r.price)) },
          {
            key: 'status', header: 'Trạng thái',
            cell: (r: any) => (
              <span className={`text-xs uppercase tracking-widest px-2 py-0.5 ${r.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' : 'bg-muted text-muted-foreground'}`}>
                {r.isActive ? 'Đang bán' : 'Đã ẩn'}
              </span>
            ),
          },
          { key: 'date', header: 'Ngày tạo', cell: (r: any) => <span className="text-xs">{formatDate(r.createdAt)}</span> },
          {
            key: 'actions', header: '', className: 'text-right w-24',
            cell: (r: any) => (
              <div className="flex justify-end gap-1">
                <Button asChild variant="ghost" size="icon" aria-label="Sửa">
                  <Link href={`/dashboard/admin/products/${r.id}`}><Edit className="h-4 w-4" /></Link>
                </Button>
                <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(r.id, r.name)} aria-label="Xóa">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ),
          },
        ]}
      />

      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Xóa sản phẩm
            </DialogTitle>
            <DialogDescription>
              Bạn muốn xóa "<strong>{deleteDialog.name}</strong>" như thế nào?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <div className="p-3 border border-border bg-blue-50 dark:bg-blue-900/20 rounded">
              <p className="text-sm font-medium">📌 Ẩn sản phẩm (Soft Delete)</p>
              <p className="text-xs text-muted-foreground mt-1">Sản phẩm sẽ ẩn khỏi shop nhưng giữ lại lịch sử đơn hàng. Có thể phục hồi sau.</p>
            </div>
            <div className="p-3 border border-destructive bg-red-50 dark:bg-red-900/20 rounded">
              <p className="text-sm font-medium">🗑️ Xóa vĩnh viễn (Hard Delete)</p>
              <p className="text-xs text-muted-foreground mt-1">Xóa sản phẩm và tất cả dữ liệu liên quan. <strong>Không thể phục hồi!</strong> (Chỉ có thể xóa nếu chưa có đơn hàng)</p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteDialog({ ...deleteDialog, open: false })} disabled={deleting}>Hủy</Button>
            <Button variant="default" onClick={softDelete} disabled={deleting}>
              Ẩn sản phẩm
            </Button>
            <Button variant="destructive" onClick={hardDelete} disabled={deleting}>
              Xóa vĩnh viễn
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}
