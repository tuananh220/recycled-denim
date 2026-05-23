import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Recycle, Droplets, Wind, Heart } from 'lucide-react';

export const metadata = {
  title: 'About — Our Story',
  description: 'INDIGO is a sustainable denim brand pioneering AI-assisted fit and 92% recycled fibres.',
};

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative h-[70vh] min-h-[480px] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1582418702059-97ebafb35d09?w=2000"
          alt="" fill priority sizes="100vw" className="object-cover"
        />
        <div className="absolute inset-0 bg-indigo-950/40" />
        <div className="relative container h-full flex flex-col justify-end pb-16 text-denim-ecru">
          <p className="text-xs uppercase tracking-widest opacity-80">Our story</p>
          <h1 className="font-serif text-5xl md:text-7xl mt-4 max-w-2xl">
            We don't make new denim.<br />
            <span className="italic font-light">We give it a second life.</span>
          </h1>
        </div>
      </section>

      {/* Manifesto */}
      <section className="container py-24 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <p className="text-xs uppercase tracking-widest text-denim-rust">Manifesto</p>
          <h2 className="font-serif text-4xl md:text-5xl mt-3">Built to outlast<br />the algorithm.</h2>
          <p className="mt-6 text-muted-foreground leading-relaxed">
            INDIGO was born in 2024 from a simple frustration: the fashion industry produces 92 million tonnes of textile waste annually,
            and most "sustainable" brands still cut from virgin fibre. We saw a better path — closing the loop entirely.
          </p>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Every garment we ship is woven from <strong className="text-foreground">80-92% post-consumer denim</strong> we collect ourselves.
            Our AI fitting room helps you buy the right size the first time, cutting returns and waste even further.
          </p>
        </div>
        <div className="relative aspect-[4/5]">
          <Image src="https://images.unsplash.com/photo-1551232864-3f0890e580d9?w=1200" alt="" fill className="object-cover" sizes="50vw" />
        </div>
      </section>

      {/* Impact metrics */}
      <section className="bg-indigo-900 text-denim-ecru py-24">
        <div className="container">
          <h2 className="font-serif text-4xl md:text-5xl text-center">Our impact, in numbers.</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
            <Impact icon={Recycle} value="12 t" label="Denim diverted from landfill / month" />
            <Impact icon={Droplets} value="92%" label="Less water vs virgin denim" />
            <Impact icon={Wind} value="0.4 kg" label="CO₂ per garment (vs 33kg avg)" />
            <Impact icon={Heart} value="38%" label="Fewer returns with AI try-on" />
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="container py-24">
        <p className="text-xs uppercase tracking-widest text-denim-rust">The process</p>
        <h2 className="font-serif text-4xl md:text-5xl mt-3 max-w-2xl">From your old pair<br />to your next favourite.</h2>
        <div className="grid md:grid-cols-5 gap-6 mt-12">
          {[
            { n: '01', t: 'Collect', d: 'Take-back stations across Asia & Europe gather discarded denim — any brand.' },
            { n: '02', t: 'Sort & shred', d: 'Mechanical fibre reclamation — no harsh chemicals, no virgin water.' },
            { n: '03', t: 'Spin', d: 'Reclaimed fibre + 8% organic cotton binder for strength.' },
            { n: '04', t: 'Dye', d: 'Natural indigo from fermented Indigofera leaves.' },
            { n: '05', t: 'Weave', d: 'Heritage shuttle looms, finished by hand in our Da Nang atelier.' },
          ].map((s) => (
            <div key={s.n} className="border-t-2 border-indigo-900 pt-4">
              <p className="font-mono text-xs text-denim-rust">{s.n}</p>
              <p className="font-medium mt-1">{s.t}</p>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container pb-24 text-center">
        <h2 className="font-serif text-4xl">Wear it forward.</h2>
        <p className="text-muted-foreground mt-3 max-w-md mx-auto">Send your old jeans back in any INDIGO envelope and we'll credit your account $20.</p>
        <Button asChild size="lg" className="mt-8"><Link href="/shop">Shop the collection</Link></Button>
      </section>
    </>
  );
}

function Impact({ icon: Icon, value, label }: { icon: any; value: string; label: string }) {
  return (
    <div className="text-center">
      <Icon className="h-6 w-6 mx-auto opacity-80" />
      <p className="font-serif text-5xl mt-4">{value}</p>
      <p className="text-xs uppercase tracking-widest mt-2 opacity-70 max-w-[160px] mx-auto">{label}</p>
    </div>
  );
}
