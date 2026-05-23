'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Heart, Moon, Search, ShoppingBag, Sun, User, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/store/cart';
import { useAuth } from '@/store/auth';

const links = [
  { href: '/shop', label: 'Shop' },
  { href: '/lookbook', label: 'Lookbook' },
  { href: '/try-on', label: 'Try-On' },
  { href: '/design', label: 'Design' },
  { href: '/stories', label: 'Stories' },
  { href: '/about', label: 'About' },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { items, fetch } = useCart();
  const { user, fetchMe } = useAuth();

  useEffect(() => { fetchMe(); /* eslint-disable-next-line */ }, []);
  useEffect(() => { if (user) fetch(); }, [user, fetch]);

  return (
    <header className="sticky top-0 z-40 bg-background/90 backdrop-blur border-b border-border">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="font-serif text-2xl tracking-[0.3em] font-semibold">INDIGO</Link>

        <nav className="hidden md:flex items-center gap-7 text-xs uppercase tracking-widest">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-denim-rust transition-colors">{l.label}</Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" aria-label="Search" asChild>
            <Link href="/shop"><Search className="h-4 w-4" /></Link>
          </Button>
          <Button variant="ghost" size="icon" aria-label="Wishlist" asChild>
            <Link href="/wishlist"><Heart className="h-4 w-4" /></Link>
          </Button>
          <Button variant="ghost" size="icon" aria-label="Account" asChild>
            <Link href={user ? '/account' : '/login'}><User className="h-4 w-4" /></Link>
          </Button>
          <Button variant="ghost" size="icon" aria-label="Cart" asChild>
            <Link href="/cart" className="relative">
              <ShoppingBag className="h-4 w-4" />
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 text-[10px] grid place-items-center bg-denim-rust text-white rounded-full">
                  {items.reduce((s, i) => s + i.quantity, 0)}
                </span>
              )}
            </Link>
          </Button>
          <Button variant="ghost" size="icon" aria-label="Theme" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            <Sun className="h-4 w-4 hidden dark:inline" />
            <Moon className="h-4 w-4 dark:hidden" />
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="container py-4 flex flex-col gap-3 text-sm uppercase tracking-widest">
            {links.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>{l.label}</Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
