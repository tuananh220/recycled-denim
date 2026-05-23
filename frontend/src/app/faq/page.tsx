import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Markdown } from '@/lib/markdown';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'FAQ — Help & Answers',
  description: 'Frequently asked questions about shipping, returns, sustainability, and AI try-on.',
};

async function getFaqs(): Promise<any[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/faq`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

export default async function FaqPage() {
  const faqs = await getFaqs();
  const grouped = faqs.reduce<Record<string, any[]>>((acc, f) => {
    (acc[f.category] ??= []).push(f);
    return acc;
  }, {});

  // JSON-LD structured data for SEO rich results
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="container py-16 max-w-3xl">
        <p className="text-xs uppercase tracking-widest text-denim-rust">Help center</p>
        <h1 className="font-serif text-5xl md:text-6xl mt-3">Questions, answered.</h1>
        <p className="mt-4 text-muted-foreground">Can't find what you're looking for? <Link href="/contact" className="underline hover:text-denim-rust">Email our team</Link>.</p>

        {Object.entries(grouped).map(([cat, items]) => (
          <section key={cat} className="mt-16">
            <h2 className="text-xs uppercase tracking-widest mb-4 text-muted-foreground">{cat}</h2>
            <Accordion type="single" collapsible className="border-t border-border">
              {items.map((f) => (
                <AccordionItem key={f.id} value={f.id}>
                  <AccordionTrigger>{f.question}</AccordionTrigger>
                  <AccordionContent><Markdown content={f.answer} /></AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        ))}

        {faqs.length === 0 && <p className="mt-12 text-muted-foreground">No FAQs published yet.</p>}

        <div className="mt-16 border-t border-border pt-8 text-center">
          <p className="text-muted-foreground">Still need help?</p>
          <Button asChild className="mt-4"><Link href="/contact">Contact us</Link></Button>
        </div>
      </section>
    </>
  );
}
