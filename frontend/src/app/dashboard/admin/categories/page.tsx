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

function slugify(s: string) { return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }

export default function AdminCategoriesPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset, setValue, watch } = useForm<{ name: string; slug: string; description?: string }>();
  const name = watch('name');

  useEffect(() => { if (name) setValue('slug', slugify(name)); }, [name, setValue]);

  async function load() { const { data } = await api.get('/categories'); setRows(data); }
  useEffect(() => { load(); }, []);

  async function onCreate(v: any) {
    try { await api.post('/categories', v); toast.success('Category created'); reset(); setOpen(false); load(); }
    catch (e: any) { toast.error(e?.response?.data?.message || 'Failed'); }
  }

  async function remove(id: string) {
    if (!confirm('Delete this category?')) return;
    try { await api.delete(`/categories/${id}`); toast.success('Deleted'); load(); }
    catch { toast.error('Cannot delete (products may still reference it)'); }
  }

  return (
    <AdminShell allow={['ADMIN']} title="Categories" description="Organize the catalog."
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4" /> New category</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New category</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit(onCreate)} className="space-y-4">
              <div><Label className="mb-1.5 block">Name</Label><Input {...register('name', { required: true })} /></div>
              <div><Label className="mb-1.5 block">Slug</Label><Input {...register('slug', { required: true })} /></div>
              <div><Label className="mb-1.5 block">Description</Label><Textarea rows={3} {...register('description')} /></div>
              <Button className="w-full">Create</Button>
            </form>
          </DialogContent>
        </Dialog>
      }>
      <DataTable
        rows={rows}
        empty="No categories yet."
        columns={[
          { key: 'name', header: 'Name', cell: (r: any) => <span className="font-medium">{r.name}</span> },
          { key: 'slug', header: 'Slug', cell: (r: any) => <span className="font-mono text-xs">/{r.slug}</span> },
          { key: 'desc', header: 'Description', cell: (r: any) => <span className="text-xs text-muted-foreground">{r.description ?? '—'}</span> },
          {
            key: 'actions', header: '', className: 'text-right w-16',
            cell: (r: any) => <Button variant="ghost" size="icon" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4" /></Button>,
          },
        ]}
      />
    </AdminShell>
  );
}
