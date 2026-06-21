import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    container: { center: true, padding: '1rem', screens: { '2xl': '1440px' } },
    extend: {
      fontFamily: {
        sans:  ['var(--font-sans)',  'ui-sans-serif',  'system-ui'],
        serif: ['var(--font-serif)', 'ui-serif',       'Georgia'],
        mono:  ['var(--font-mono)',  'ui-monospace',   'monospace'],
      },
      colors: {
        indigo: {
          50:  '#f1f4f9', 100: '#dde5ef', 200: '#b9c8db', 300: '#8ea7c2',
          400: '#5e7fa1', 500: '#3e6082', 600: '#2d4a6b', 700: '#243d59',
          800: '#1c2f44', 900: '#0f1f33', 950: '#0a1626',
        },
        denim: {
          raw: '#1f3a5f', washed: '#7ea2c4', stone: '#b6c4d4',
          ecru: '#f5efe6', rust: '#a65a3f',
        },
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        border: 'hsl(var(--border))',
        ring: 'hsl(var(--ring))',
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
      },
      keyframes: {
        'fade-up': { '0%': { opacity: '0', transform: 'translateY(10px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
        'accordion-up':   { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
        'marquee':        { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
      },
      animation: {
        'fade-up': 'fade-up .5s ease-out',
        shimmer: 'shimmer 1.6s linear infinite',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        marquee: 'marquee 30s linear infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
export default config;
