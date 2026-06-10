'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';
import { AdminShell } from '@/components/dashboard/admin-shell';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ImageUploader } from '@/components/dashboard/image-uploader';
import { api } from '@/lib/api';

interface FormValues { title: string; subtitle?: string; ctaText?: string; ctaUrl?: string; position?: number }

export default function AdminBannersPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [img, setImg] = useState<string[]>([]);
  const { register, handleSubmit, reset } = useForm<FormValues>();

  async function load() {
    try { const { data } = await api.get('/banners'); setRows(data); }
    catch { setRows([]); }
  }
  useEffect(() => { load(); }, []);

  async function onCreate(v: FormValues) {
    if (img.length === 0) { toast.error('Thêm ảnh banner'); return; }
    try {
      await api.post('/banners', { ...v, imageUrl: img[0], isActive: true, position: Number(v.position) || 0 });
      toast.success('Đã tạo banner'); reset(); setImg([]); setOpen(false); load();
    } catch (e: any) { toast.error(e?.response?.data?.message || 'Thất bại'); }
  }

  async function toggleActive(b: any) {
    try { await api.patch(`/banners/${b.id}`, { isActive: !b.isActive }); load(); }
    catch { toast.error('Thất bại'); }
  }

  async function remove(id: string) {
    if (!confirm('Xóa banner?')) return;
    try { await api.delete(`/banners/${id}`); toast.success('Đã xóa'); load(); }
    catch { toast.error('Thất bại'); }
  }

  return (
    <AdminShell allow={['ADMIN']} title="Banner" description="Banner trang chủ & quảng cáo."
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4" /> Banner mới</Button></DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader><DialogTitle>Banner mới</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit(onCreate)} className="space-y-4">
              <div><Label className="mb-1.5 block">Ảnh</Label><ImageUploader value={img} onChange={setImg} multiple={false} folder="echove/banners" /></div>
              <div><Label className="mb-1.5 block">Tiêu đề</Label><Input {...register('title', { required: true })} /></div>
              <div><Label className="mb-1.5 block">Phụ đề</Label><Textarea rows={2} {...register('subtitle')} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="mb-1.5 block">Text nút CTA</Label><Input {...register('ctaText')} placeholder="Mua ngay" /></div>
                <div><Label className="mb-1.5 block">Link CTA</Label><Input {...register('ctaUrl')} placeholder="/shop" /></div>
              </div>
              <div><Label className="mb-1.5 block">Thứ tự hiển thị</Label><Input type="number" {...register('position')} defaultValue={0} /></div>
              <Button className="w-full">Tạo</Button>
            </form>
          </DialogContent>
        </Dialog>
      }>
      {rows.length === 0 ? (
        <div className="border border-border p-12 text-center text-sm text-muted-foreground">Chưa có banner nào.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rows.map((b) => (
            <article key={b.id} className="border border-border overflow-hidden">
              <div className="aspect-[16/9] bg-muted relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b.imageUrl} alt={b.title} className="absolute inset-0 w-full h-full object-cover" />
              </div>
              <div className="p-4 space-y-2">
                <p className="font-medium">{b.title}</p>
                {b.subtitle && <p className="text-xs text-muted-foreground line-clamp-2">{b.subtitle}</p>}
                <div className="flex justify-between items-center pt-2">
                  <Button size="sm" variant={b.isActive ? 'default' : 'outline'} onClick={() => toggleActive(b)}>
                    {b.isActive ? 'Đang bật' : 'Đã tắt'}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => remove(b.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
