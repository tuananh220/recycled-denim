import Link from 'next/link';
import Image from 'next/image';
import { Instagram, Facebook, Youtube, Mail, MapPin } from 'lucide-react';
import { BRAND } from '@/lib/brand';

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-background">
      <div className="container py-16 grid gap-10 md:grid-cols-5">
        <div className="md:col-span-2">
          <Link href="/" className="inline-block mb-3">
            <Image
              src="/logo.png"
              alt={BRAND.name}
              width={140}
              height={42}
              className="h-10 w-auto object-contain dark:brightness-125"
            />
          </Link>
          <p className="mt-4 font-sans text-lg italic">"{BRAND.tagline}"</p>
          <p className="mt-3 text-sm text-muted-foreground max-w-xs">{BRAND.mission}</p>
          <div className="flex gap-3 mt-6">
            <Social href={BRAND.social.instagram} icon={Instagram} />
            <Social href={BRAND.social.tiktok} icon={TikTokIcon} />
            <Social href={BRAND.social.facebook} icon={Facebook} />
            <Social href={BRAND.social.youtube} icon={Youtube} />
          </div>
        </div>
        <FooterCol title="Shop"     links={[['Tất cả', '/shop'], ['Phụ kiện', '/shop?category=accessories'], ['Trang phục', '/shop?category=jeans'], ['Lookbook', '/lookbook']]} />
        <FooterCol title="Trải nghiệm" links={[['AI Try-On', '/try-on'], ['Design Studio', '/design'], ['Wishlist', '/wishlist']]} />
        <FooterCol title="Về ECHOVE"   links={[['Câu chuyện', '/about'], ['Stories', '/stories'], ['FAQ', '/faq'], ['Liên hệ', '/contact']]} />
      </div>

      <div className="border-t border-border">
        <div className="container py-6 flex flex-col md:flex-row justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} ECHOVE — Cũ người, chất ta.</p>
          <div className="flex gap-4">
            <span className="flex items-center gap-1.5"><Mail className="h-3 w-3" /> {BRAND.email}</span>
            <span className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /> TP. Hồ Chí Minh</span>
          </div>
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

function TikTokIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.16a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.59z"/>
    </svg>
  );
}
