import Link from 'next/link';
import { Instagram, Twitter, Facebook, Youtube } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-background">
      <div className="container py-16 grid gap-10 md:grid-cols-5">
        <div className="md:col-span-2">
          <p className="font-serif text-2xl tracking-[0.3em]">INDIGO</p>
          <p className="mt-4 text-sm text-muted-foreground max-w-xs">
            Worn. Reborn. Premium recycled denim crafted to outlast trends, powered by AI fit & design.
          </p>
          <div className="flex gap-3 mt-6">
            <Social href="https://instagram.com" icon={Instagram} />
            <Social href="https://twitter.com" icon={Twitter} />
            <Social href="https://facebook.com" icon={Facebook} />
            <Social href="https://youtube.com" icon={Youtube} />
          </div>
        </div>
        <FooterCol title="Shop"      links={[['All', '/shop'], ['Jeans', '/shop?category=jeans'], ['Jackets', '/shop?category=jackets'], ['Lookbook', '/lookbook']]} />
        <FooterCol title="Experience" links={[['AI Try-On', '/try-on'], ['Design Studio', '/design'], ['Wishlist', '/wishlist']]} />
        <FooterCol title="Company"   links={[['About', '/about'], ['Stories', '/stories'], ['FAQ', '/faq'], ['Contact', '/contact']]} />
      </div>

      <div className="border-t border-border">
        <div className="container py-6 flex flex-col md:flex-row justify-between gap-2 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} INDIGO Denim Co. — All rights reserved.</p>
          <p>92% Post-Consumer Recycled · Climate Neutral Certified</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest mb-4">{title}</p>
      <ul className="space-y-2 text-sm">
        {links.map(([label, href]) => (
          <li key={href}><Link href={href} className="hover:text-denim-rust transition-colors">{label}</Link></li>
        ))}
      </ul>
    </div>
  );
}

function Social({ href, icon: Icon }: { href: string; icon: any }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
       className="h-9 w-9 grid place-items-center border border-border hover:border-indigo-900 hover:text-denim-rust transition-colors">
      <Icon className="h-4 w-4" />
    </a>
  );
}
