'use client';
import { Truck } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const THRESHOLD = 500_000; // 500.000 VNĐ

export function FreeShippingBar({ subtotal }: { subtotal: number }) {
  const remaining = Math.max(0, THRESHOLD - subtotal);
  const pct = Math.min(100, (subtotal / THRESHOLD) * 100);
  const reached = remaining === 0;

  return (
    <div className="border border-border p-4 space-y-2">
      <div className="flex items-center gap-2 text-sm">
        <Truck className="h-4 w-4 text-denim-rust" />
        {reached ? (
          <span className="font-medium">🎉 Bạn được miễn phí vận chuyển!</span>
        ) : (
          <span>
            Mua thêm <span className="font-medium">{formatCurrency(remaining)}</span> để được{' '}
            <span className="font-medium">MIỄN PHÍ VẬN CHUYỂN</span>
          </span>
        )}
      </div>
      <div className="h-1 bg-muted overflow-hidden">
        <div className="h-full bg-indigo-900 transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
