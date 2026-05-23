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

export default function AdminFaqPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm<any>({
    defaultValues: { category: 'General', position: 0 },
  });

  async function load() { const { data } = await api.get('/faq/admin/all'); setRows(data); }
  useEffect(() => { load(); }, []);

  async function onCreate(v: any) {
    try {
      await api.post('/faq', { ...v, position: Number(v.position) || 0, isActive: true });
      toast.success('Created'); reset({ category: 'General', position: 0 }); setOpen(false); load();
    } catch (e: any) { toast.error(e?.response?.data?.message || 'Failed'); }
  }

  async function toggleActive(f: any) {
    try { await api.patch(`/faq/${f.id}`, { isActive: !f.isActive }); load(); }
    catch { toast.error('Failed'); }
  }

  async function remove(id: string) {
    if (!confirm('Delete FAQ?')) return;
    try { await api.delete(`/faq/${id}`); toast.success('Deleted'); load(); }
    catch { toast.error('Failed'); }
  }

  return (
    <AdminShell allow={['ADMIN']} title="FAQ" description="Help center entries grouped by category."
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4" /> New FAQ</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New FAQ</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit(onCreate)} className="space-y-4">
              <div><Label className="mb-1.5 block">Category</Label><Input {...register('category', { required: true })} /></div>
              <div><Label className="mb-1.5 block">Question</Label><Input {...register('question', { required: true })} /></div>
              <div><Label className="mb-1.5 block">Answer (Markdown)</Label><Textarea rows={5} {...register('answer', { required: true })} /></div>
              <div><Label className="mb-1.5 block">Position</Label><Input type="number" {...register('position')} /></div>
              <Button className="w-full">Create</Button>
            </form>
          </DialogContent>
        </Dialog>
      }>
      <DataTable
        rows={rows}
        empty="No FAQ yet."
        columns={[
          { key: 'cat', header: 'Category', cell: (r: any) => <span className="text-xs uppercase tracking-widest">{r.category}</span> },
          { key: 'q', header: 'Question', cell: (r: any) => <span className="font-medium">{r.question}</span> },
          { key: 'pos', header: 'Pos', className: 'w-12 text-center', cell: (r: any) => r.position },
          {
            key: 'active', header: 'Active',
            cell: (r: any) => (
              <Button size="sm" variant={r.isActive ? 'default' : 'outline'} onClick={() => toggleActive(r)}>
                {r.isActive ? 'Yes' : 'No'}
              </Button>
            ),
          },
          { key: 'actions', header: '', className: 'text-right w-16',
            cell: (r: any) => <Button variant="ghost" size="icon" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4" /></Button> },
        ]}
      />
    </AdminShell>
  );
}
