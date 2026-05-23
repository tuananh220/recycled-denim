'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { useCart } from '@/store/cart';
import { useAuth } from '@/store/auth';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';

export function QuickViewButton({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [size, setSize] = useState<string>('');
  const [color, setColor] = useState<string>('');
  const { add } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  async function openQV(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setOpen(true);
    if (product) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/products/${slug}`);
      setProduct(data);
      setSize(data.sizes?.[0] ?? '');
      setColor(data.colors?.[0] ?? '');
    } catch { toast.error('Could not load product'); }
    finally { setLoading(false); }
  }

  async function onAdd() {
    if (!user) { router.push('/login'); return; }
    if (!product) return;
    await add(product.id, size, color, 1);
    toast.success('Added to bag');
    setOpen(false);
  }

  return (
    <>
      <button
        onClick={openQV}
        className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition bg-background/95 backdrop-blur px-4 py-2 text-xs uppercase tracking-widest border border-border hover:bg-indigo-900 hover:text-denim-ecru"
      >
        <Eye className="inline h-3 w-3 mr-1.5 -mt-0.5" /> Quick view
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl p-0 grid md:grid-cols-2 gap-0 overflow-hidden">
          <DialogTitle className="sr-only">{product?.name ?? 'Product'}</DialogTitle>
          {loading || !product ? (
            <div className="md:col-span-2 p-12 text-center text-muted-foreground">Loading…</div>
          ) : (
            <>
              <div className="relative aspect-square bg-muted">
                <Image src={product.images?.[0]?.url} alt={product.name} fill sizes="50vw" className="object-cover" />
              </div>
              <div className="p-8 flex flex-col">
                <Badge className="border-denim-rust text-denim-rust w-fit">{product.recycledPercent}% Recycled</Badge>
                <h2 className="font-serif text-3xl mt-3">{product.name}</h2>
                <p className="text-xl mt-1">{formatCurrency(Number(product.price))}</p>
                <p className="text-xs text-muted-foreground mt-3 line-clamp-3">{product.description}</p>

                <div className="mt-4">
                  <p className="text-xs uppercase tracking-widest mb-2">Size</p>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes?.map((s: string) => (
                      <button
                        key={s} onClick={() => setSize(s)}
                        className={`h-9 w-11 grid place-items-center border text-sm ${size === s ? 'border-indigo-900 bg-indigo-900 text-denim-ecru' : 'border-border'}`}
                      >{s}</button>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-xs uppercase tracking-widest mb-2">Color</p>
                  <div className="flex gap-2">
                    {product.colors?.map((c: string) => (
                      <button
                        key={c} onClick={() => setColor(c)} aria-label={c}
                        className={`h-7 w-7 rounded-full border-2 ${color === c ? 'border-indigo-900' : 'border-border'}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                <div className="mt-auto pt-6 space-y-2">
                  <Button onClick={onAdd} size="lg" className="w-full">Add to bag</Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/shop/${product.slug}`}>View details</Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/try-on?productId=${product.id}`}><Sparkles className="h-3 w-3" /> Try-on</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
