import type { Metadata } from 'next';
import { Inter, Cormorant_Garamond } from 'next/font/google';
import '../styles/globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { AnnouncementBar } from '@/components/marketing/announcement-bar';
import { NewsletterPopup } from '@/components/marketing/newsletter-popup';

const sans = Inter({ subsets: ['latin'], variable: '--font-sans' });
const serif = Cormorant_Garamond({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-serif' });

export const metadata: Metadata = {
  title: { default: 'INDIGO — Recycled Denim. Reborn.', template: '%s · INDIGO' },
  description: 'Premium recycled denim, AI-powered try-on, and custom design — sustainable fashion redefined.',
  openGraph: {
    title: 'INDIGO — Recycled Denim',
    description: 'AI-powered, 92% recycled denim. Worn. Reborn.',
    type: 'website',
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sans.variable} ${serif.variable}`} suppressHydrationWarning>
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
