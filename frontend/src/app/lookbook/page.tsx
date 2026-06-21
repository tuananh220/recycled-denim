import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Lookbook — SS26 Tái Sinh',
  description: 'Bộ ảnh editorial từ bộ sưu tập SS26 Tái Sinh của ECHOVE.',
};

const looks = [
  { src: 'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=1600', span: 'lg:col-span-2 lg:row-span-2', title: 'Look 01' },
  { src: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=1200',  span: '', title: 'Look 02' },
  { src: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=1200',  span: '', title: 'Look 03' },
  { src: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=1600', span: 'lg:col-span-2', title: 'Look 04' },
  { src: 'https://images.unsplash.com/photo-1582418702059-97ebafb35d09?w=1200', span: '', title: 'Look 05' },
  { src: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200',  span: '', title: 'Look 06' },
  { src: 'https://images.unsplash.com/photo-1551232864-3f0890e580d9?w=1600',  span: 'lg:col-span-2', title: 'Look 07' },
];

export default function LookbookPage() {
  return (
    <>
      <section className="container py-16 max-w-3xl text-center">
        <p className="text-xs uppercase tracking-widest text-denim-rust">SS26</p>
        <h1 className="font-sans text-5xl md:text-7xl mt-3">Tái Sinh.</h1>
        <p className="mt-6 text-muted-foreground">
          Bảy outfit, tất cả từ jean cũ tái chế. Chụp tại Atelier ECHOVE — Quận 2, TP.HCM. 
          Photography: Nam Hoàng. Stylist: Linh Đan.
        </p>
      </section>

      <section className="container pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-[minmax(280px,1fr)] gap-4">
          {looks.map((l) => (
            <figure key={l.title} className={`relative overflow-hidden bg-muted group ${l.span}`}>
              <Image src={l.src} alt={l.title} fill sizes="(max-width:1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-1000 group-hover:scale-105" />
              <figcaption className="absolute bottom-3 left-3 text-[10px] uppercase tracking-widest text-denim-ecru bg-indigo-950/60 backdrop-blur px-2 py-1">
                {l.title}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="container pb-24 text-center">
        <h2 className="font-sans text-4xl">Khám phá bộ sưu tập</h2>
        <Button asChild size="lg" className="mt-6"><Link href="/shop">Xem SS26</Link></Button>
      </section>
    </>
  );
}
