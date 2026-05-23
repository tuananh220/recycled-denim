import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Recycle, Sparkles, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrustBadges } from '@/components/marketing/trust-badges';
import { RecentlyViewed } from '@/components/marketing/recently-viewed';
import { Testimonials } from '@/components/marketing/testimonials';
import { InstagramFeed } from '@/components/marketing/instagram-feed';

async function getFeatured() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?pageSize=6`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? [];
  } catch { return []; }
}

async function getLatestPosts() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.slice(0, 3);
  } catch { return []; }
}

export default async function Home() {
  const [featured, posts] = await Promise.all([getFeatured(), getLatestPosts()]);

  return (
    <>
      {/* HERO */}
      <section className="relative h-[88vh] min-h-[560px] overflow-hidden">
        <div className="absolute inset-0 denim-grain" />
        <Image
          src="https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=2000&q=80"
          alt="Recycled denim hero" fill priority sizes="100vw"
          className="object-cover opacity-60 mix-blend-overlay"
        />
        <div className="relative container h-full flex flex-col justify-end pb-20 text-denim-ecru">
          <Badge className="border-denim-ecru text-denim-ecru w-fit mb-6">SS26 · The Reborn Drop</Badge>
          <h1 className="text-6xl md:text-8xl font-serif leading-[0.95]">
            Worn.<br />
            <span className="italic font-light">Reborn.</span>
          </h1>
          <p className="mt-6 max-w-md text-base text-denim-ecru/80">
            92% post-consumer recycled denim, AI-assisted fit, and zero-waste tailoring. Built for the next generation of style.
          </p>
          <div className="mt-8 flex gap-3">
            <Button asChild size="lg" variant="outline" className="border-denim-ecru text-denim-ecru hover:bg-denim-ecru hover:text-indigo-900">
              <Link href="/shop">Shop the drop <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="ghost" className="text-denim-ecru hover:bg-white/10">
              <Link href="/try-on">Try AI fit</Link>
            </Button>
          </div>
        </div>
      </section>

      <TrustBadges />

      {/* PILLARS */}
      <section className="container py-24 grid md:grid-cols-3 gap-12">
        {[
          { icon: Recycle, title: 'Recycled, always', desc: 'Every garment is woven from 80–92% post-consumer denim, diverting tons of textile waste.' },
          { icon: Sparkles, title: 'AI virtual try-on', desc: 'See exactly how a piece sits on you in seconds — no fitting room required.' },
          { icon: Palette,  title: 'Design your own', desc: 'Drag, drop, paint and patch a one-of-one piece in our in-browser studio.' },
        ].map((p) => (
          <div key={p.title} className="animate-fade-up">
            <p.icon className="h-6 w-6 text-denim-rust" />
            <h3 className="mt-4 text-2xl">{p.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
          </div>
        ))}
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="container pb-24">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs uppercase tracking-widest text-denim-rust">New In</p>
            <h2 className="text-4xl md:text-5xl mt-2">Featured pieces</h2>
          </div>
          <Link href="/shop" className="text-xs uppercase tracking-widest hover:text-denim-rust">View all →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
          {featured.length === 0 && Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="shimmer aspect-[3/4]" />
          ))}
          {featured.slice(0, 4).map((p: any) => (
            <Link key={p.id} href={`/shop/${p.slug}`} className="group">
              <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                <Image
                  src={p.images?.[0]?.url || 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800'}
                  alt={p.name} fill sizes="(max-width:768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="mt-3 flex justify-between text-sm">
                <span>{p.name}</span>
                <span className="font-medium">${Number(p.price).toFixed(0)}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{p.recycledPercent}% recycled</p>
            </Link>
          ))}
        </div>
      </section>

      <Testimonials />

      {/* STORIES TEASER */}
      {posts.length > 0 && (
        <section className="container py-24">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs uppercase tracking-widest text-denim-rust">Journal</p>
              <h2 className="text-4xl md:text-5xl mt-2">Stories from the loom</h2>
            </div>
            <Link href="/stories" className="text-xs uppercase tracking-widest hover:text-denim-rust">Read all →</Link>
          </div>
          <div className="grid md:grid-cols-3 gap-x-6 gap-y-12">
            {posts.map((p: any) => (
              <Link key={p.id} href={`/stories/${p.slug}`} className="group">
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  <Image src={p.coverImageUrl} alt={p.title} fill sizes="33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                <div className="mt-4">
                  <div className="flex gap-2 text-[10px] uppercase tracking-widest text-denim-rust">
                    {p.tags?.slice(0, 2).map((t: string) => <span key={t}>{t}</span>)}
                  </div>
                  <h3 className="font-serif text-xl mt-2 group-hover:text-denim-rust transition-colors">{p.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{p.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <RecentlyViewed />

      {/* CTA BAND */}
      <section className="bg-indigo-900 text-denim-ecru py-24">
        <div className="container grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-5xl">Designed by you.<br /><span className="italic font-light">Crafted by us.</span></h2>
            <p className="mt-4 text-denim-ecru/70 max-w-md">
              Sketch your idea in our in-browser studio, our designers review every piece, and we hand-craft it from reclaimed denim.
            </p>
            <Button asChild size="lg" variant="outline" className="mt-8 border-denim-ecru text-denim-ecru hover:bg-denim-ecru hover:text-indigo-900">
              <Link href="/design">Open the studio</Link>
            </Button>
          </div>
          <div className="relative aspect-square">
            <Image src="https://images.unsplash.com/photo-1604176354204-9268737828e4?w=1000"
              alt="Custom design" fill className="object-cover" sizes="(max-width:768px) 100vw, 40vw" />
          </div>
        </div>
      </section>

      <InstagramFeed />
    </>
  );
}
