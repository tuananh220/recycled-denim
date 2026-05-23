'use client';
import { Truck } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const THRESHOLD = 200;

export function FreeShippingBar({ subtotal }: { subtotal: number }) {
  const remaining = Math.max(0, THRESHOLD - subtotal);
  const pct = Math.min(100, (subtotal / THRESHOLD) * 100);
  const reached = remaining === 0;

  return (
    <div className="border border-border p-4 space-y-2">
      <div className="flex items-center gap-2 text-sm">
        <Truck className="h-4 w-4 text-denim-rust" />
        {reached ? (
          <span className="font-medium">🎉 You unlocked free shipping!</span>
        ) : (
          <span>
            Add <span className="font-medium">{formatCurrency(remaining)}</span> more for <span className="font-medium">FREE shipping</span>
          </span>
        )}
      </div>
      <div className="h-1 bg-muted overflow-hidden">
        <div
          className="h-full bg-indigo-900 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
