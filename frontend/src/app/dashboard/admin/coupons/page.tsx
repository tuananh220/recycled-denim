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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';

interface FormValues { code: string; type: 'PERCENT' | 'FIXED'; value: number; expiresAt?: string }

export default function AdminCouponsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset, setValue, watch } = useForm<FormValues>({
    defaultValues: { type: 'PERCENT' },
  });

  async function load() { const { data } = await api.get('/coupons'); setRows(data); }
  useEffect(() => { load(); }, []);

  async function onCreate(v: FormValues) {
    try {
      await api.post('/coupons', {
        code: v.code.toUpperCase(), type: v.type, value: Number(v.value),
        expiresAt: v.expiresAt ? new Date(v.expiresAt).toISOString() : undefined,
        isActive: true,
      });
      toast.success('Coupon created'); reset({ type: 'PERCENT' }); setOpen(false); load();
    } catch (e: any) { toast.error(e?.response?.data?.message || 'Failed'); }
  }

  async function remove(id: string) {
    if (!confirm('Delete coupon?')) return;
    try { await api.delete(`/coupons/${id}`); toast.success('Deleted'); load(); }
    catch { toast.error('Failed'); }
  }

  return (
    <AdminShell allow={['ADMIN']} title="Coupons" description="Discount codes." actions={
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild><Button><Plus className="h-4 w-4" /> New coupon</Button></DialogTrigger>
        <DialogContent>
          <DialogHeader><DialogTitle>New coupon</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onCreate)} className="space-y-4">
            <div><Label className="mb-1.5 block">Code</Label><Input {...register('code', { required: true })} placeholder="SUMMER20" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-1.5 block">Type</Label>
                <Select value={watch('type')} onValueChange={(v) => setValue('type', v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENT">Percent (%)</SelectItem>
                    <SelectItem value="FIXED">Fixed amount ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label className="mb-1.5 block">Value</Label><Input type="number" step="0.01" {...register('value', { required: true, valueAsNumber: true })} /></div>
            </div>
            <div><Label className="mb-1.5 block">Expires at (optional)</Label><Input type="date" {...register('expiresAt')} /></div>
            <Button className="w-full">Create</Button>
          </form>
        </DialogContent>
      </Dialog>
    }>
      <DataTable
        rows={rows}
        empty="No coupons yet."
        columns={[
          { key: 'code', header: 'Code', cell: (r: any) => <span className="font-mono font-medium">{r.code}</span> },
          { key: 'type', header: 'Type', cell: (r: any) => r.type === 'PERCENT' ? `${r.value}%` : `$${r.value}` },
          { key: 'uses', header: 'Uses', cell: (r: any) => r.uses },
          { key: 'exp', header: 'Expires', cell: (r: any) => r.expiresAt ? formatDate(r.expiresAt) : 'Never' },
          {
            key: 'active', header: 'Active',
            cell: (r: any) => <span className={`text-xs px-2 py-0.5 ${r.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' : 'bg-muted'}`}>{r.isActive ? 'Yes' : 'No'}</span>,
          },
          { key: 'actions', header: '', className: 'text-right w-16',
            cell: (r: any) => <Button variant="ghost" size="icon" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4" /></Button> },
        ]}
      />
    </AdminShell>
  );
}
