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
import { Markdown } from '@/lib/markdown';
import { api } from '@/lib/api';

interface FormValues {
  title: string; slug: string; excerpt: string; content: string;
  tags: string; status: 'DRAFT' | 'PUBLISHED';
}

function slugify(s: string) {
  return s.toLowerCase().trim()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function PostForm({ postId }: { postId?: string }) {
  const router = useRouter();
  const isEdit = !!postId;
  const [cover, setCover] = useState<string[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const { register, handleSubmit, setValue, watch, reset } = useForm<FormValues>({
    defaultValues: { status: 'DRAFT' },
  });
  const title = watch('title');
  const content = watch('content');

  useEffect(() => { if (!isEdit && title) setValue('slug', slugify(title)); }, [title, isEdit, setValue]);

  useEffect(() => {
    if (!isEdit) return;
    api.get('/posts/admin/all').then(({ data }) => {
      const post = data.find((p: any) => p.id === postId);
      if (!post) return;
      reset({
        title: post.title, slug: post.slug, excerpt: post.excerpt,
        content: post.content, tags: (post.tags ?? []).join(','),
        status: post.status,
      });
      setCover(post.coverImageUrl ? [post.coverImageUrl] : []);
    }).finally(() => setLoading(false));
  }, [postId, isEdit, reset]);

  async function onSubmit(v: FormValues) {
    if (cover.length === 0) { toast.error('Thêm ảnh bìa'); return; }
    setSaving(true);
    try {
      const payload = {
        ...v, coverImageUrl: cover[0],
        tags: v.tags.split(',').map((t) => t.trim()).filter(Boolean),
      };
      if (isEdit) await api.patch(`/posts/${postId}`, payload);
      else await api.post('/posts', payload);
      toast.success(isEdit ? 'Đã cập nhật' : 'Đã tạo');
      router.push('/dashboard/admin/posts');
    } catch (e: any) { toast.error(e?.response?.data?.message || 'Lưu thất bại'); }
    finally { setSaving(false); }
  }

  if (loading) return <div className="shimmer h-64" />;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-3xl">
      <section>
        <Label className="mb-2 block">Ảnh bìa</Label>
        <ImageUploader value={cover} onChange={setCover} multiple={false} folder="echove/posts" />
      </section>

      <section className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2"><Label className="mb-1.5 block">Tiêu đề</Label><Input {...register('title', { required: true })} /></div>
        <div><Label className="mb-1.5 block">Slug</Label><Input {...register('slug', { required: true })} /></div>
        <div>
          <Label className="mb-1.5 block">Trạng thái</Label>
          <Select value={watch('status')} onValueChange={(v) => setValue('status', v as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="DRAFT">Bản nháp</SelectItem>
              <SelectItem value="PUBLISHED">Đã đăng</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="sm:col-span-2"><Label className="mb-1.5 block">Tóm tắt</Label><Textarea rows={2} {...register('excerpt', { required: true })} /></div>
        <div className="sm:col-span-2"><Label className="mb-1.5 block">Tags (cách bằng dấu phẩy)</Label><Input {...register('tags')} placeholder="Bền vững,Câu chuyện" /></div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-2">
          <Label>Nội dung (Markdown)</Label>
          <button type="button" onClick={() => setPreview(!preview)} className="text-xs underline hover:text-denim-rust">
            {preview ? 'Sửa' : 'Xem trước'}
          </button>
        </div>
        {preview
          ? <div className="border border-border p-6 min-h-[400px]"><Markdown content={content || ''} /></div>
          : <Textarea rows={18} className="font-mono text-sm" {...register('content', { required: true })} placeholder="# Tiêu đề&#10;&#10;Nội dung…" />
        }
      </section>

      <div className="flex gap-3 pt-4 border-t border-border">
        <Button type="submit" size="lg" disabled={saving}>{saving ? 'Đang lưu…' : isEdit ? 'Cập nhật' : 'Tạo bài'}</Button>
        <Button type="button" variant="outline" size="lg" onClick={() => router.push('/dashboard/admin/posts')}>Hủy</Button>
      </div>
    </form>
  );
}
