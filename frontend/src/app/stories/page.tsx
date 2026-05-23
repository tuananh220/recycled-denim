import Link from 'next/link';
import Image from 'next/image';
import { formatDate } from '@/lib/utils';

export const metadata = {
  title: 'Stories — Journal',
  description: 'Sustainability, craft, and the people behind INDIGO.',
};

async function getPosts(): Promise<any[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

export default async function StoriesPage() {
  const posts = await getPosts();
  const [hero, ...rest] = posts;

  return (
    <div className="container py-16">
      <p className="text-xs uppercase tracking-widest text-denim-rust">Journal</p>
      <h1 className="font-serif text-5xl md:text-6xl mt-3 mb-12">Stories</h1>

      {posts.length === 0 ? (
        <p className="text-muted-foreground">No stories published yet.</p>
      ) : (
        <>
          {/* Hero post */}
          {hero && (
            <Link href={`/stories/${hero.slug}`} className="group block mb-20">
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  <Image src={hero.coverImageUrl} alt={hero.title} fill sizes="(max-width:1024px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                <div>
                  <div className="flex gap-2 text-[10px] uppercase tracking-widest text-denim-rust">
                    {hero.tags?.map((t: string) => <span key={t}>{t}</span>)}
                  </div>
                  <h2 className="font-serif text-4xl md:text-5xl mt-3 group-hover:text-denim-rust transition-colors">{hero.title}</h2>
                  <p className="mt-4 text-muted-foreground">{hero.excerpt}</p>
                  <p className="text-xs text-muted-foreground mt-6">{hero.author?.name} · {formatDate(hero.publishedAt)}</p>
                </div>
              </div>
            </Link>
          )}

          {/* Grid */}
          {rest.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-14 border-t border-border pt-16">
              {rest.map((p) => (
                <Link key={p.id} href={`/stories/${p.slug}`} className="group">
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    <Image src={p.coverImageUrl} alt={p.title} fill sizes="(max-width:768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105" />
                  </div>
                  <div className="mt-4">
                    <div className="flex gap-2 text-[10px] uppercase tracking-widest text-denim-rust">
                      {p.tags?.slice(0, 2).map((t: string) => <span key={t}>{t}</span>)}
                    </div>
                    <h3 className="font-serif text-2xl mt-2 group-hover:text-denim-rust transition-colors">{p.title}</h3>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{p.excerpt}</p>
                    <p className="text-xs text-muted-foreground mt-3">{formatDate(p.publishedAt)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
