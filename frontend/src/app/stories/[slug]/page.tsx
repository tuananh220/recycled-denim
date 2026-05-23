import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Markdown } from '@/lib/markdown';
import { formatDate } from '@/lib/utils';

async function getPost(slug: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${slug}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getPost(slug);
  return {
    title: p?.metaTitle ?? p?.title ?? 'Story',
    description: p?.metaDescription ?? p?.excerpt,
    openGraph: { images: p?.coverImageUrl ? [p.coverImageUrl] : [] },
  };
}

export default async function StoryDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    image: [post.coverImageUrl],
    datePublished: post.publishedAt,
    author: { '@type': 'Person', name: post.author?.name },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <article>
        {/* Hero */}
        <header className="relative h-[60vh] min-h-[420px] overflow-hidden">
          <Image src={post.coverImageUrl} alt={post.title} fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-indigo-950/40" />
          <div className="relative container h-full flex flex-col justify-end pb-12 text-denim-ecru">
            <div className="flex gap-2 text-[10px] uppercase tracking-widest opacity-80">
              {post.tags?.map((t: string) => <span key={t}>{t}</span>)}
            </div>
            <h1 className="font-serif text-4xl md:text-6xl mt-4 max-w-3xl">{post.title}</h1>
            <p className="text-xs uppercase tracking-widest mt-4 opacity-80">{post.author?.name} · {formatDate(post.publishedAt)}</p>
          </div>
        </header>

        {/* Content */}
        <div className="container py-16 max-w-2xl">
          <Markdown content={post.content} />
        </div>

        <div className="container pb-24 max-w-2xl">
          <Link href="/stories" className="text-xs uppercase tracking-widest hover:text-denim-rust">← Back to journal</Link>
        </div>
      </article>
    </>
  );
}
