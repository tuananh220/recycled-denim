'use client';
import { Ruler } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';

const sizes = [
  { size: 'XS', waist: '24"', hip: '34"', length: '30"' },
  { size: 'S',  waist: '26"', hip: '36"', length: '30"' },
  { size: 'M',  waist: '28"', hip: '38"', length: '32"' },
  { size: 'L',  waist: '30"', hip: '40"', length: '32"' },
  { size: 'XL', waist: '32"', hip: '42"', length: '34"' },
];

export function SizeGuide() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="text-xs uppercase tracking-widest flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition">
          <Ruler className="h-3 w-3" /> Size guide
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Size Guide</DialogTitle>
          <DialogDescription>Measurements are in inches. For best fit, measure over fitted clothing.</DialogDescription>
        </DialogHeader>
        <table className="w-full text-sm mt-2">
          <thead>
            <tr className="text-xs uppercase tracking-widest text-muted-foreground border-b border-border">
              <th className="text-left py-2">Size</th>
              <th>Waist</th><th>Hip</th><th>Length</th>
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
          💡 Between sizes? We recommend sizing down for slim cuts, up for relaxed/wide-leg.
        </p>
      </DialogContent>
    </Dialog>
  );
}
