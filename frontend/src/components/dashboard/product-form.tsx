'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUploader } from '@/components/dashboard/image-uploader';
import { api } from '@/lib/api';

interface FormValues {
  name: string; slug: string; description: string;
  price: number; compareAtPrice?: number;
  recycledPercent: number; categoryId: string;
  sizes: string;  // comma separated
  colors: string; // comma separated hex
  isActive: boolean; isFeatured: boolean;
}

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function ProductForm({ productId }: { productId?: string }) {
  const router = useRouter();
  const isEdit = !!productId;
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [images, setImages] = useState<string[]>([]);

  const { register, handleSubmit, setValue, watch, reset } = useForm<FormValues>({
    defaultValues: {
      recycledPercent: 85, isActive: true, isFeatured: false,
      sizes: 'XS,S,M,L,XL', colors: '#1f3a5f,#0f2540',
    },
  });
  const nameVal = watch('name');

  useEffect(() => { api.get('/categories').then((r) => setCategories(r.data)); }, []);

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/products/admin/${productId}`).then(({ data }) => {
      reset({
        name: data.name, slug: data.slug, description: data.description,
        price: Number(data.price),
        compareAtPrice: data.compareAtPrice ? Number(data.compareAtPrice) : undefined,
        recycledPercent: data.recycledPercent, categoryId: data.categoryId,
        sizes: data.sizes.join(','), colors: data.colors.join(','),
        isActive: data.isActive, isFeatured: data.isFeatured,
      });
      setImages(data.images?.map((i: any) => i.url) ?? []);
    }).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  }, [productId, isEdit, reset]);

  // Auto-generate slug for new products
  useEffect(() => {
    if (!isEdit && nameVal) setValue('slug', slugify(nameVal));
  }, [nameVal, isEdit, setValue]);

  async function onSubmit(v: FormValues) {
    setSaving(true);
    try {
      const payload = {
        name: v.name, slug: v.slug, description: v.description,
        price: Number(v.price),
        compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : undefined,
        recycledPercent: Number(v.recycledPercent),
        categoryId: v.categoryId,
        sizes: v.sizes.split(',').map((s) => s.trim()).filter(Boolean),
        colors: v.colors.split(',').map((c) => c.trim()).filter(Boolean),
        isActive: v.isActive, isFeatured: v.isFeatured,
        imageUrls: images,
      };
      if (isEdit) {
        await api.patch(`/products/${productId}`, payload);
        toast.success('Product updated');
      } else {
        await api.post('/products', payload);
        toast.success('Product created');
      }
      router.push('/dashboard/admin/products');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  }

  if (loading) return <div className="shimmer h-64" />;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-3xl">
      {/* Images */}
      <section>
        <Label className="mb-2 block">Images</Label>
        <ImageUploader value={images} onChange={setImages} folder="indigo/products" />
        <p className="text-xs text-muted-foreground mt-2">First image becomes the thumbnail. Drag-and-drop coming soon.</p>
      </section>

      {/* Basics */}
      <section className="grid sm:grid-cols-2 gap-4">
        <Field label="Name"><Input {...register('name', { required: true })} /></Field>
        <Field label="Slug (URL)"><Input {...register('slug', { required: true })} /></Field>
        <Field label="Description" full><Textarea rows={4} {...register('description', { required: true })} /></Field>
        <Field label="Price (USD)"><Input type="number" step="0.01" {...register('price', { required: true, valueAsNumber: true })} /></Field>
        <Field label="Compare-at price"><Input type="number" step="0.01" {...register('compareAtPrice', { valueAsNumber: true })} /></Field>
        <Field label="Category">
          <Select onValueChange={(v) => setValue('categoryId', v)} value={watch('categoryId') || ''}>
            <SelectTrigger><SelectValue placeholder="Choose…" /></SelectTrigger>
            <SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="Recycled %"><Input type="number" min={0} max={100} {...register('recycledPercent', { valueAsNumber: true })} /></Field>
      </section>

      {/* Variants */}
      <section className="grid sm:grid-cols-2 gap-4">
        <Field label="Sizes (comma separated)"><Input {...register('sizes')} placeholder="XS,S,M,L,XL" /></Field>
        <Field label="Colors (hex, comma separated)"><Input {...register('colors')} placeholder="#1f3a5f,#0f2540" /></Field>
      </section>

      {/* Flags */}
      <section className="flex gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...register('isActive')} className="h-4 w-4" /> Active (visible in shop)
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...register('isFeatured')} className="h-4 w-4" /> Featured on home
        </label>
      </section>

      <div className="flex gap-3 pt-4 border-t border-border">
        <Button type="submit" size="lg" disabled={saving}>{saving ? 'Saving…' : isEdit ? 'Update product' : 'Create product'}</Button>
        <Button type="button" variant="outline" size="lg" onClick={() => router.push('/dashboard/admin/products')}>Cancel</Button>
      </div>
    </form>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <Label className="mb-1.5 block">{label}</Label>
      {children}
    </div>
  );
}
