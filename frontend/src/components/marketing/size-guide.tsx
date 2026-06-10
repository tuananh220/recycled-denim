'use client';
import { Ruler } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';

const sizes = [
  { size: 'XS', waist: '60-64',  hip: '84-88',  length: '76' },
  { size: 'S',  waist: '64-68',  hip: '88-92',  length: '76' },
  { size: 'M',  waist: '68-72',  hip: '92-96',  length: '81' },
  { size: 'L',  waist: '72-76',  hip: '96-100', length: '81' },
  { size: 'XL', waist: '76-80',  hip: '100-104', length: '86' },
];

export function SizeGuide() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="text-xs uppercase tracking-widest flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition">
          <Ruler className="h-3 w-3" /> Bảng size
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bảng kích cỡ</DialogTitle>
          <DialogDescription>Đơn vị: cm. Đo qua lớp đồ lót hoặc đồ vừa người.</DialogDescription>
        </DialogHeader>
        <table className="w-full text-sm mt-2">
          <thead>
            <tr className="text-xs uppercase tracking-widest text-muted-foreground border-b border-border">
              <th className="text-left py-2">Size</th>
              <th>Eo</th><th>Hông</th><th>Dài</th>
            </tr>
          </thead>
          <tbody>
            {sizes.map((s) => (
              <tr key={s.size} className="border-b border-border last:border-0">
                <td className="py-2 font-medium">{s.size}</td>
                <td className="text-center">{s.waist}</td>
                <td className="text-center">{s.hip}</td>
                <td className="text-center">{s.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs text-muted-foreground mt-4">
          💡 Nếu giữa 2 size: chọn size nhỏ hơn cho slim fit, size lớn hơn cho oversized.
        </p>
        <p className="text-xs text-muted-foreground">
          ⚠️ Vì mỗi sản phẩm là 1-of-1, có sai số ±1cm so với bảng chuẩn.
        </p>
      </DialogContent>
    </Dialog>
  );
}
