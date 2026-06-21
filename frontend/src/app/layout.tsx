import type { Metadata } from 'next';
import { DM_Sans, Playfair_Display, DM_Mono } from 'next/font/google';
import '../styles/globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { AnnouncementBar } from '@/components/marketing/announcement-bar';
import { NewsletterPopup } from '@/components/marketing/newsletter-popup';
import { BRAND } from '@/lib/brand';

const sans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});
const serif = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});
const mono = DM_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: `${BRAND.name} — ${BRAND.tagline}`,
    template: `%s · ${BRAND.name}`,
  },
  description: BRAND.mission,
  openGraph: {
    title: `${BRAND.name} — ${BRAND.tagline}`,
    description: BRAND.mission,
    type: 'website',
    locale: 'vi_VN',
  },
  keywords: ['recycled denim', 'tái chế jean', 'thời trang bền vững', 'Gen Z fashion', 'ECHOVE', 'circular fashion'],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${sans.variable} ${serif.variable} ${mono.variable}`} suppressHydrationWarning>
        <ThemeProvider>
          <AnnouncementBar />
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <NewsletterPopup />
        </ThemeProvider>
      </body>
    </html>
  );
}
