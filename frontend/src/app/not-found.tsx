import Link from 'next/link';
import { Button } from '@/components/ui/button';
export default function NotFound() {
  return (
    <div className="container py-32 text-center">
      <p className="text-xs uppercase tracking-widest text-denim-rust">404</p>
      <h1 className="text-6xl mt-4">Page not found</h1>
      <p className="mt-4 text-muted-foreground">The thread you&apos;re pulling doesn&apos;t exist.</p>
      <Button asChild className="mt-8"><Link href="/">Back to home</Link></Button>
    </div>
  );
}
