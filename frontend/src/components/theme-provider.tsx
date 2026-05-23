'use client';
import { ThemeProvider as NextThemes } from 'next-themes';
import { Toaster } from 'sonner';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemes attribute="class" defaultTheme="light" enableSystem>
      {children}
      <Toaster position="top-right" theme="system" />
    </NextThemes>
  );
}
