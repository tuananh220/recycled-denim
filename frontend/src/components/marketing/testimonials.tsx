'use client';
import { useEffect, useState } from 'react';
import { Quote, Star } from 'lucide-react';
import { api } from '@/lib/api';

interface Testimonial {
  id: string; authorName: string; authorRole?: string; avatarUrl?: string;
  quote: string; rating: number;
}

export function Testimonials() {
  const [items, setItems] = useState<Testimonial[]>([]);

  useEffect(() => {
    api.get('/testimonials').then((r) => setItems(r.data)).catch(() => setItems([]));
  }, []);

  if (items.length === 0) return null;

  // Duplicate for seamless marquee loop
  const loop = [...items, ...items];

  return (
    <section className="py-24 bg-muted/30 border-y border-border overflow-hidden">
      <div className="container mb-12 text-center">
        <p className="text-xs uppercase tracking-widest text-denim-rust">Loved by</p>
        <h2 className="font-sans text-4xl md:text-5xl mt-3">Our community</h2>
      </div>

      <div className="relative">
        <div className="flex gap-6 w-max animate-marquee hover:[animation-play-state:paused]">
          {loop.map((t, i) => (
            <article key={`${t.id}-${i}`} className="w-[360px] bg-background border border-border p-8">
              <Quote className="h-5 w-5 text-denim-rust" />
              <p className="mt-4 text-base leading-relaxed">"{t.quote}"</p>
              <div className="mt-6 flex items-center gap-3">
                {t.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={t.avatarUrl} alt={t.authorName} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-muted grid place-items-center text-xs">{t.authorName[0]}</div>
                )}
                <div>
                  <p className="text-sm font-medium">{t.authorName}</p>
                  {t.authorRole && <p className="text-xs text-muted-foreground">{t.authorRole}</p>}
                </div>
                <div className="ml-auto flex">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="h-3 w-3 fill-denim-rust text-denim-rust" />
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
