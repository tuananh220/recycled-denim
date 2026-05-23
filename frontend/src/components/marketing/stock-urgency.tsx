'use client';
import { useEffect, useState } from 'react';
import { Eye, Flame } from 'lucide-react';

export function StockUrgency({
  size, color, inventory,
}: {
  size: string;
  color: string;
  inventory?: { size: string; color: string; quantity: number }[];
}) {
  const [viewers, setViewers] = useState<number | null>(null);

  // Fake "X people are viewing" social proof — pseudo-random but stable per session
  useEffect(() => {
    setViewers(Math.floor(Math.random() * 12) + 5);
    const id = setInterval(() => {
      setViewers((v) => Math.max(3, Math.min(28, (v ?? 10) + (Math.random() > 0.5 ? 1 : -1))));
    }, 8000);
    return () => clearInterval(id);
  }, [size, color]);

  const variant = inventory?.find((i) => i.size === size && i.color === color);
  const qty = variant?.quantity;

  return (
    <div className="space-y-1.5 text-xs">
      {qty !== undefined && qty > 0 && qty <= 5 && (
        <p className="flex items-center gap-1.5 text-denim-rust font-medium animate-pulse">
          <Flame className="h-3 w-3" /> Only {qty} left in size {size} — order soon
        </p>
      )}
      {qty === 0 && (
        <p className="flex items-center gap-1.5 text-muted-foreground">
          Out of stock in this combination — try another size or color
        </p>
      )}
      {viewers !== null && (
        <p className="flex items-center gap-1.5 text-muted-foreground">
          <Eye className="h-3 w-3" /> {viewers} people are viewing this piece
        </p>
      )}
    </div>
  );
}
