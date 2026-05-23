'use client';
import { useEffect, useState } from 'react';
import { AdminShell } from '@/components/dashboard/admin-shell';
import { api } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function WarehouseDashboard() {
  const [rows, setRows] = useState<any[]>([]);
  const [edits, setEdits] = useState<Record<string, number>>({});

  async function load() { const { data } = await api.get('/inventory'); setRows(data); }
  useEffect(() => { load(); }, []);

  async function save(id: string) {
    const quantity = edits[id]; if (quantity === undefined) return;
    try { await api.patch(`/inventory/${id}`, { quantity }); toast.success('Updated'); load(); }
    catch { toast.error('Failed'); }
  }

  return (
    <AdminShell allow={['WAREHOUSE', 'ADMIN']} title="Inventory" description="Stock levels across SKUs.">
      <div className="border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="text-left py-3 px-4">SKU</th>
              <th className="text-left">Product</th>
              <th>Size</th><th>Color</th><th>Qty</th><th></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-muted/30">
                <td className="py-2 px-4 font-mono text-xs">{r.sku}</td>
                <td>{r.product?.name}</td>
                <td className="text-center">{r.size}</td>
                <td className="text-center"><span className="inline-block w-4 h-4 border rounded-full" style={{ backgroundColor: r.color }} /></td>
                <td className="text-center w-24">
                  <Input type="number" defaultValue={r.quantity}
                    onChange={(e) => setEdits((s) => ({ ...s, [r.id]: +e.target.value }))} className="h-8" />
                </td>
                <td className="text-right pr-4"><Button size="sm" onClick={() => save(r.id)}>Save</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
