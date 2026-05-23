'use client';
import { useEffect, useState } from 'react';

const KEY = 'indigo.recentlyViewed';
const MAX = 12;

export interface RecentlyViewedItem {
  id: string;
  slug: string;
  name: string;
  price: number | string;
  image?: string;
  recycledPercent?: number;
}

export function trackRecentlyViewed(item: RecentlyViewedItem) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(KEY);
    const arr: RecentlyViewedItem[] = raw ? JSON.parse(raw) : [];
    const filtered = arr.filter((x) => x.id !== item.id);
    filtered.unshift(item);
    localStorage.setItem(KEY, JSON.stringify(filtered.slice(0, MAX)));
  } catch {}
}

export function useRecentlyViewed(excludeId?: string) {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      const arr: RecentlyViewedItem[] = raw ? JSON.parse(raw) : [];
      setItems(excludeId ? arr.filter((x) => x.id !== excludeId) : arr);
    } catch {}
  }, [excludeId]);
  return items;
}
