import Image from 'next/image';
import { Instagram } from 'lucide-react';

const posts = [
  'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800',
  'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=800',
  'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',
  'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800',
  'https://images.unsplash.com/photo-1582418702059-97ebafb35d09?w=800',
  'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800',
];

export function InstagramFeed() {
  return (
    <section className="container py-24">
      <div className="flex flex-col items-center text-center mb-10">
        <Instagram className="h-5 w-5 text-denim-rust" />
        <p className="text-xs uppercase tracking-widest mt-3 text-denim-rust">@echove.vn</p>
        <h2 className="font-serif text-4xl md:text-5xl mt-3">Khoe outfit của bạn</h2>
        <p className="mt-3 text-sm text-muted-foreground max-w-md">
          Chia sẻ outfit ECHOVE với hashtag <strong className="text-foreground">#JeanCuChuyenMoi</strong> để được feature trang chủ.
        </p>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-1">
        {posts.map((src, i) => (
          <a key={i} href="https://instagram.com" target="_blank" rel="noopener noreferrer"
            className="relative aspect-square overflow-hidden bg-muted group">
            <Image src={src} alt={`Instagram post ${i + 1}`} fill sizes="(max-width:768px) 33vw, 16vw"
              className="object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-indigo-900/0 group-hover:bg-indigo-900/40 transition-colors grid place-items-center">
              <Instagram className="h-5 w-5 text-denim-ecru opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
