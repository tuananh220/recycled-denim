'use client';
import { useRef, useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { compressImage } from '@/lib/image';

interface Props {
  value: string[];
  onChange: (urls: string[]) => void;
  multiple?: boolean;
  folder?: string;
  maxSize?: number;
}

export function ImageUploader({ value, onChange, multiple = true, folder = 'indigo/admin', maxSize = 1600 }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const f of files) {
        const compressed = await compressImage(f, maxSize, 0.85);
        const { data } = await api.post('/upload/image', { data: compressed, folder });
        urls.push(data.url);
        if (data.mock) {
          toast.message('Cloudinary not configured', {
            description: 'Image kept as inline data URI (dev mode).',
          });
        }
      }
      onChange(multiple ? [...value, ...urls] : urls);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  function remove(idx: number) {
    onChange(value.filter((_, i) => i !== idx));
  }

  return (
    <div>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {value.map((url, i) => (
          <div key={url + i} className="relative aspect-square border border-border bg-muted overflow-hidden group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <button
              type="button" onClick={() => remove(i)}
              className="absolute top-1 right-1 p-1 bg-background/90 opacity-0 group-hover:opacity-100 transition"
              aria-label="Remove"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        <button
          type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
          className="aspect-square border border-dashed border-border grid place-items-center text-xs text-muted-foreground hover:border-indigo-900 hover:text-foreground transition disabled:opacity-50"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Upload className="h-4 w-4 mb-1" /> Add</>}
        </button>
      </div>
      <input ref={fileRef} type="file" accept="image/*" multiple={multiple} className="hidden" onChange={onPick} />
    </div>
  );
}
