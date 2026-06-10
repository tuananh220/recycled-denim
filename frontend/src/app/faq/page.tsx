import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Markdown } from '@/lib/markdown';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Câu hỏi thường gặp',
  description: 'Các câu hỏi về vận chuyển, đổi trả, bền vững và thử AI tại ECHOVE.',
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

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: 'vi-VN',
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
        <p className="text-xs uppercase tracking-widest text-denim-rust">Trợ giúp</p>
        <h1 className="font-serif text-5xl md:text-6xl mt-3">Câu hỏi thường gặp.</h1>
        <p className="mt-4 text-muted-foreground">
          Không tìm thấy câu trả lời? <Link href="/contact" className="underline hover:text-denim-rust">Liên hệ với chúng tôi</Link>.
        </p>

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

        {faqs.length === 0 && <p className="mt-12 text-muted-foreground">Chưa có FAQ nào được đăng.</p>}

        <div className="mt-16 border-t border-border pt-8 text-center">
          <p className="text-muted-foreground">Vẫn cần hỗ trợ?</p>
          <Button asChild className="mt-4"><Link href="/contact">Liên hệ ngay</Link></Button>
        </div>
      </section>
    </>
  );
}
