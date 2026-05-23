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
    if (!confirm('Deactivate this product?')) return;
    try { await api.delete(`/products/${id}`); toast.success('Deactivated'); load(); }
    catch { toast.error('Failed'); }
  }

  return (
    <AdminShell
      allow={['ADMIN']}
      title="Products"
      description="Manage your catalog — create, edit, deactivate."
      actions={
        <Button asChild><Link href="/dashboard/admin/products/new"><Plus className="h-4 w-4" /> New product</Link></Button>
      }
    >
      <div className="flex gap-2 mb-4">
        <Input placeholder="Search by name or slug…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-sm" />
        <Button variant="outline" onClick={load} disabled={loading}>Search</Button>
      </div>

      <DataTable
        rows={rows}
        empty="No products yet."
        columns={[
          {
            key: 'thumb', header: '', className: 'w-16',
            cell: (r: any) => r.images?.[0]?.url
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={r.images[0].url} alt="" className="w-12 h-12 object-cover" />
              : <div className="w-12 h-12 bg-muted" />,
          },
          {
            key: 'name', header: 'Product',
            cell: (r: any) => (
              <div>
                <Link href={`/shop/${r.slug}`} className="font-medium hover:text-denim-rust">{r.name}</Link>
                <p className="text-xs text-muted-foreground">/{r.slug}</p>
              </div>
            ),
          },
          { key: 'cat', header: 'Category', cell: (r: any) => r.category?.name },
          { key: 'price', header: 'Price', cell: (r: any) => formatCurrency(Number(r.price)) },
          {
            key: 'status', header: 'Status',
            cell: (r: any) => (
              <span className={`text-xs uppercase tracking-widest px-2 py-0.5 ${r.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' : 'bg-muted text-muted-foreground'}`}>
                {r.isActive ? 'Active' : 'Inactive'}
              </span>
            ),
          },
          { key: 'date', header: 'Created', cell: (r: any) => <span className="text-xs">{formatDate(r.createdAt)}</span> },
          {
            key: 'actions', header: '', className: 'text-right w-24',
            cell: (r: any) => (
              <div className="flex justify-end gap-1">
                <Button asChild variant="ghost" size="icon" aria-label="Edit">
                  <Link href={`/dashboard/admin/products/${r.id}`}><Edit className="h-4 w-4" /></Link>
                </Button>
                <Button variant="ghost" size="icon" onClick={() => remove(r.id)} aria-label="Delete">
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
