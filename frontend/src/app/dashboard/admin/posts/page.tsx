'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { AdminShell } from '@/components/dashboard/admin-shell';
import { DataTable } from '@/components/dashboard/data-table';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';

export default function AdminPostsPage() {
  const [rows, setRows] = useState<any[]>([]);

  async function load() { const { data } = await api.get('/posts/admin/all'); setRows(data); }
  useEffect(() => { load(); }, []);

  async function remove(id: string) {
    if (!confirm('Xóa bài viết này vĩnh viễn?')) return;
    try { await api.delete(`/posts/${id}`); toast.success('Đã xóa'); load(); }
    catch { toast.error('Thất bại'); }
  }

  return (
    <AdminShell
      allow={['ADMIN']}
      title="Bài viết"
      description="Tạp chí & câu chuyện thương hiệu."
      actions={<Button asChild><Link href="/dashboard/admin/posts/new"><Plus className="h-4 w-4" /> Bài viết mới</Link></Button>}
    >
      <DataTable
        rows={rows}
        empty="Chưa có bài viết nào."
        columns={[
          {
            key: 'thumb', header: '', className: 'w-20',
            cell: (r: any) => r.coverImageUrl
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={r.coverImageUrl} alt="" className="w-14 h-14 object-cover" />
              : <div className="w-14 h-14 bg-muted" />,
          },
          {
            key: 'title', header: 'Tiêu đề',
            cell: (r: any) => (
              <div>
                <p className="font-medium">{r.title}</p>
                <p className="text-xs text-muted-foreground">/{r.slug}</p>
              </div>
            ),
          },
          { key: 'tags', header: 'Tags', cell: (r: any) => <span className="text-xs">{r.tags?.join(', ')}</span> },
          {
            key: 'status', header: 'Trạng thái',
            cell: (r: any) => (
              <span className={`text-xs uppercase tracking-widest px-2 py-0.5 ${r.status === 'PUBLISHED' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' : 'bg-muted'}`}>
                {r.status === 'PUBLISHED' ? 'Đã đăng' : 'Bản nháp'}
              </span>
            ),
          },
          { key: 'date', header: 'Cập nhật', cell: (r: any) => <span className="text-xs">{formatDate(r.updatedAt)}</span> },
          {
            key: 'actions', header: '', className: 'text-right w-24',
            cell: (r: any) => (
              <div className="flex justify-end gap-1">
                <Button asChild variant="ghost" size="icon"><Link href={`/dashboard/admin/posts/${r.id}`}><Edit className="h-4 w-4" /></Link></Button>
                <Button variant="ghost" size="icon" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ),
          },
        ]}
      />
    </AdminShell>
  );
}
