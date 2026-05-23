'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Sparkles, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useAuth } from '@/store/auth';
import { compressImage } from '@/lib/image';

export function TryOnClient() {
  const { user, hydrated, fetchMe } = useAuth();
  const router = useRouter();
  const sp = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [productId, setProductId] = useState<string>('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchMe(); }, [fetchMe]);

  useEffect(() => {
    if (hydrated && !user) router.push('/login');
  }, [hydrated, user, router]);

  useEffect(() => {
    if (!user) return;
    api.get('/products', { params: { pageSize: 20 } })
      .then((r) => setProducts(r.data?.data || []))
      .catch(() => toast.error('Could not load products'));
  }, [user]);

  useEffect(() => {
    const idFromUrl = sp.get('productId');
    if (idFromUrl) setProductId(idFromUrl);
  }, [sp]);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    try {
      // Compress to ~1024px / JPEG 0.85 so payload stays small (~200-500 KB)
      const compressed = await compressImage(f, 1024, 0.85);
      setPhoto(compressed);
    } catch {
      toast.error('Could not read image');
    }
  }

  async function generate() {
    if (!photo || !productId) { toast.error('Pick a product and upload your photo'); return; }
    setLoading(true); setResult(null);
    try {
      const { data } = await api.post('/tryon', { productId, userImageUrl: photo });
      if (data.status === 'SUCCEEDED' && data.resultUrl) {
        setResult(data.resultUrl);
        toast.success('Generated!');
      } else {
        toast.error(data.errorMessage || 'Generation failed');
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Try-on failed');
    } finally { setLoading(false); }
  }

  if (!hydrated) return <div className="container py-24 text-center text-muted-foreground">Loading…</div>;
  if (!user) return null;

  return (
    <div className="container py-12">
      <header className="mb-10 max-w-2xl">
        <p className="text-xs uppercase tracking-widest text-denim-rust">AI Studio</p>
        <h1 className="text-5xl mt-2">Virtual try-on</h1>
        <p className="mt-3 text-muted-foreground">Upload a clear, well-lit photo of yourself, pick a denim piece, and our AI will dress you in seconds.</p>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="border border-border p-6 space-y-4">
          <p className="text-xs uppercase tracking-widest">1 · Your photo</p>
          <div className="aspect-[3/4] bg-muted relative overflow-hidden">
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} alt="you" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 grid place-items-center text-muted-foreground text-sm">No photo yet</div>
            )}
          </div>
          <Button variant="outline" className="w-full" onClick={() => fileRef.current?.click()}>
            <Upload className="h-4 w-4" /> Upload photo
          </Button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
        </div>

        <div className="border border-border p-6 space-y-4">
          <p className="text-xs uppercase tracking-widest">2 · Pick a piece</p>
          <div className="grid grid-cols-2 gap-2 max-h-[480px] overflow-y-auto pr-1">
            {products.map((p) => (
              <button
                key={p.id}
                onClick={() => setProductId(p.id)}
                className={`relative aspect-[3/4] overflow-hidden border-2 ${productId === p.id ? 'border-indigo-900' : 'border-transparent'}`}
              >
                <Image src={p.images?.[0]?.url} alt={p.name} fill className="object-cover" sizes="200px" />
                <span className="absolute bottom-0 inset-x-0 text-xs bg-background/90 py-1 truncate px-1">{p.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="border border-border p-6 space-y-4">
          <p className="text-xs uppercase tracking-widest">3 · Result</p>
          <div className="aspect-[3/4] bg-muted relative overflow-hidden">
            {loading && <div className="absolute inset-0 grid place-items-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}
            {result && !loading && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={result} alt="result" className="absolute inset-0 w-full h-full object-cover animate-fade-up" />
            )}
            {!result && !loading && (
              <div className="absolute inset-0 grid place-items-center text-muted-foreground text-sm">Your fit will appear here</div>
            )}
          </div>
          <Button className="w-full" onClick={generate} disabled={loading || !photo || !productId}>
            <Sparkles className="h-4 w-4" /> {loading ? 'Generating…' : 'Generate'}
          </Button>
        </div>
      </div>

      {result && photo && (
        <section className="mt-16">
          <h2 className="text-3xl mb-6">Before · After</h2>
          <div className="grid grid-cols-2 gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo} alt="before" className="aspect-[3/4] object-cover w-full" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={result} alt="after" className="aspect-[3/4] object-cover w-full" />
          </div>
        </section>
      )}
    </div>
  );
}
