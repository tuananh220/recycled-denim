'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';
import { AdminShell } from '@/components/dashboard/admin-shell';
import { DataTable } from '@/components/dashboard/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';

function slugify(s: string) {
  return s.toLowerCase().trim()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function AdminCategoriesPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset, setValue, watch } = useForm<{ name: string; slug: string; description?: string }>();
  const name = watch('name');

  useEffect(() => { if (name) setValue('slug', slugify(name)); }, [name, setValue]);

  async function load() { const { data } = await api.get('/categories'); setRows(data); }
  useEffect(() => { load(); }, []);

  async function onCreate(v: any) {
    try { await api.post('/categories', v); toast.success('Đã tạo danh mục'); reset(); setOpen(false); load(); }
    catch (e: any) { toast.error(e?.response?.data?.message || 'Thất bại'); }
  }

  async function remove(id: string) {
    if (!confirm('Xóa danh mục này?')) return;
    try { await api.delete(`/categories/${id}`); toast.success('Đã xóa'); load(); }
    catch { toast.error('Không xóa được (vẫn còn sản phẩm)'); }
  }

  return (
    <AdminShell allow={['ADMIN']} title="Danh mục" description="Phân loại sản phẩm."
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4" /> Danh mục mới</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Danh mục mới</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit(onCreate)} className="space-y-4">
              <div><Label className="mb-1.5 block">Tên</Label><Input {...register('name', { required: true })} /></div>
              <div><Label className="mb-1.5 block">Slug</Label><Input {...register('slug', { required: true })} /></div>
              <div><Label className="mb-1.5 block">Mô tả</Label><Textarea rows={3} {...register('description')} /></div>
              <Button className="w-full">Tạo</Button>
            </form>
          </DialogContent>
        </Dialog>
      }>
      <DataTable
        rows={rows}
        empty="Chưa có danh mục."
        columns={[
          { key: 'name', header: 'Tên',  cell: (r: any) => <span className="font-medium">{r.name}</span> },
          { key: 'slug', header: 'Slug', cell: (r: any) => <span className="font-mono text-xs">/{r.slug}</span> },
          { key: 'desc', header: 'Mô tả', cell: (r: any) => <span className="text-xs text-muted-foreground">{r.description ?? '—'}</span> },
          {
            key: 'actions', header: '', className: 'text-right w-16',
            cell: (r: any) => <Button variant="ghost" size="icon" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4" /></Button>,
          },
        ]}
      />
    </AdminShell>
  );
}
