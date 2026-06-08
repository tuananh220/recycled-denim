'use client';
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

const ENDS_AT = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
const STORAGE_KEY = 'echove.announcementDismissed';

function getTimeLeft(target: Date) {
  const diff = Math.max(0, target.getTime() - Date.now());
  const d = Math.floor(diff / 86_400_000);
  const h = Math.floor((diff % 86_400_000) / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1000);
  return { d, h, m, s };
}

export function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(true);
  const [t, setT] = useState(getTimeLeft(ENDS_AT));

  useEffect(() => {
    setDismissed(localStorage.getItem(STORAGE_KEY) === '1');
    const id = setInterval(() => setT(getTimeLeft(ENDS_AT)), 1000);
    return () => clearInterval(id);
  }, []);

  if (dismissed) return null;

  return (
    <div className="relative bg-indigo-900 text-denim-ecru text-xs">
      <div className="container py-2 flex items-center justify-center gap-3 text-center">
        <span className="uppercase tracking-widest">🌱 1-of-1 Drop · Giảm 10% với mã</span>
        <span className="font-mono font-bold tracking-widest border border-denim-ecru/40 px-2 py-0.5">CHAO10</span>
        <span className="hidden sm:inline opacity-80">
          còn <span className="font-mono tabular-nums">{t.d}d {String(t.h).padStart(2,'0')}h {String(t.m).padStart(2,'0')}m {String(t.s).padStart(2,'0')}s</span>
        </span>
      </div>
      <button
        onClick={() => { setDismissed(true); localStorage.setItem(STORAGE_KEY, '1'); }}
        aria-label="Dismiss"
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 opacity-70 hover:opacity-100"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}
