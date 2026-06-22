'use client';
import { useEffect, useState } from 'react';
import { AdminShell } from '@/components/dashboard/admin-shell';
import { api } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Plus, Minus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function WarehouseDashboard() {
  const [rows, setRows] = useState<any[]>([]);
  const [edits, setEdits] = useState<Record<string, number>>({});
  const [adjustDialog, setAdjustDialog] = useState<{ open: boolean; id: string; name: string; current: number }>({ open: false, id: '', name: '', current: 0 });
  const [adjustValue, setAdjustValue] = useState(0);

  async function load() {
    const { data } = await api.get('/inventory');
    setRows(data);
  }
  useEffect(() => { load(); }, []);

  async function save(id: string) {
    const quantity = edits[id];
    if (quantity === undefined) return;
    try {
      await api.patch(`/inventory/${id}`, { quantity });
      toast.success('Đã cập nhật');
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Thất bại');
    }
  }

  async function adjust() {
    if (!adjustDialog.id) return;
    try {
      await api.post(`/inventory/${adjustDialog.id}/adjust`, {
        adjustment: adjustValue,
        reason: 'Kho điều chỉnh',
      });
      toast.success(`Đã điều chỉnh: ${adjustValue > 0 ? '+' : ''}${adjustValue}`);
      setAdjustDialog({ open: false, id: '', name: '', current: 0 });
      setAdjustValue(0);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Thất bại');
    }
  }

  const openAdjustDialog = (id: string, name: string, current: number) => {
    setAdjustDialog({ open: true, id, name, current });
    setAdjustValue(0);
  };

  return (
    <AdminShell allow={['WAREHOUSE', 'ADMIN']} title="Inventory" description="Quản lý số lượng tồn kho.">
      <div className="border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="text-left py-3 px-4">SKU</th>
              <th className="text-left">Sản phẩm</th>
              <th>Size</th>
              <th>Màu</th>
              <th>SL Hiện Tại</th>
              <th>Cập Nhật</th>
              <th></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-muted/30">
                <td className="py-2 px-4 font-mono text-xs">{r.sku}</td>
                <td>{r.product?.name}</td>
                <td className="text-center">{r.size}</td>
                <td className="text-center">
                  <span className="inline-block w-4 h-4 border rounded-full" style={{ backgroundColor: r.color }} />
                </td>
                <td className="text-center font-medium">{r.quantity}</td>
                <td className="text-center w-32">
                  <Input
                    type="number"
                    defaultValue={r.quantity}
                    onChange={(e) => setEdits((s) => ({ ...s, [r.id]: +e.target.value }))}
                    className="h-8"
                  />
                </td>
                <td className="text-right pr-4 flex gap-1 justify-end">
                  <Button size="sm" onClick={() => save(r.id)}>Lưu</Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openAdjustDialog(r.id, r.product?.name, r.quantity)}
                  >
                    Điều chỉnh
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={adjustDialog.open} onOpenChange={(open) => setAdjustDialog({ ...adjustDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Điều chỉnh số lượng</DialogTitle>
            <DialogDescription>
              {adjustDialog.name} (Hiện tại: <strong>{adjustDialog.current}</strong>)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setAdjustValue(adjustValue - 1)}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                value={adjustValue}
                onChange={(e) => setAdjustValue(+e.target.value)}
                className="text-center text-lg font-bold"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setAdjustValue(adjustValue + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Kết quả: {adjustDialog.current} + ({adjustValue > 0 ? '+' : ''}{adjustValue}) = <strong>{adjustDialog.current + adjustValue}</strong>
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdjustDialog({ ...adjustDialog, open: false })}>
              Hủy
            </Button>
            <Button onClick={adjust}>Xác nhận</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}
