'use client';
import { create } from 'zustand';
import { api } from '@/lib/api';

export interface CartItem {
  id: string; productId: string; size: string; color: string; quantity: number;
  product: { name: string; slug: string; price: number | string; images: { url: string }[] };
}

interface CartState {
  items: CartItem[];
  loading: boolean;
  fetch: () => Promise<void>;
  add: (productId: string, size: string, color: string, quantity?: number) => Promise<void>;
  update: (id: string, quantity: number) => Promise<void>;
  remove: (id: string) => Promise<void>;
  clear: () => Promise<void>;
  count: () => number;
  subtotal: () => number;
}

export const useCart = create<CartState>((set, get) => ({
  items: [], loading: false,
  async fetch() {
    set({ loading: true });
    try { const { data } = await api.get('/cart'); set({ items: data?.items ?? [] }); }
    catch { set({ items: [] }); }
    finally { set({ loading: false }); }
  },
  async add(productId, size, color, quantity = 1) {
    await api.post('/cart/items', { productId, size, color, quantity });
    await get().fetch();
  },
  async update(id, quantity) { await api.patch(`/cart/items/${id}`, { quantity }); await get().fetch(); },
  async remove(id) { await api.delete(`/cart/items/${id}`); await get().fetch(); },
  async clear() { await api.delete('/cart'); set({ items: [] }); },
  count() { return get().items.reduce((s, i) => s + i.quantity, 0); },
  subtotal() { return get().items.reduce((s, i) => s + Number(i.product.price) * i.quantity, 0); },
}));
