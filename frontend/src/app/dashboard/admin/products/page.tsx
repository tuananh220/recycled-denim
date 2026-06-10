'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { AdminShell } from '@/components/dashboard/admin-shell';
import { DataTable } from '@/components/dashboard/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function AdminProductsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get('/products/admin/all', { params: { pageSize: 50, q: q || undefined } });
      setRows(data.data);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  async function remove(id: string) {
    if (!confirm('Ẩn sản phẩm này?')) return;
    try { await api.delete(`/products/${id}`); toast.success('Đã ẩn'); load(); }
    catch { toast.error('Thất bại'); }
  }

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
                <Button variant="ghost" size="icon" onClick={() => remove(r.id)} aria-label="Xóa">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ),
          },
        ]}
      />
    </AdminShell>
  );
}
