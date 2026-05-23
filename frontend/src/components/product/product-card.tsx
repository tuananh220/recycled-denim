import Link from 'next/link';
import Image from 'next/image';
import { formatCurrency } from '@/lib/utils';
import { QuickViewButton } from '@/components/marketing/quick-view';

export interface ProductCardProps {
  slug: string;
  name: string;
  price: number | string;
  compareAtPrice?: number | string | null;
  recycledPercent?: number;
  image?: string;
  showQuickView?: boolean;
}

export function ProductCard({
  slug, name, price, compareAtPrice, recycledPercent = 80, image, showQuickView = true,
}: ProductCardProps) {
  return (
    <div className="group">
      <Link href={`/shop/${slug}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-muted">
          <Image
            src={image || 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800'}
            alt={name} fill sizes="(max-width:768px) 50vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <span className="absolute top-3 left-3 text-[10px] uppercase tracking-widest bg-background/80 backdrop-blur px-2 py-1">
            {recycledPercent}% Recycled
          </span>
          {showQuickView && <QuickViewButton slug={slug} />}
        </div>
        <div className="mt-3 flex justify-between text-sm">
          <span className="truncate pr-2">{name}</span>
          <span className="font-medium">
            {formatCurrency(Number(price))}
            {compareAtPrice && (
              <span className="ml-2 line-through text-muted-foreground">{formatCurrency(Number(compareAtPrice))}</span>
            )}
          </span>
        </div>
      </Link>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div>
      <div className="shimmer aspect-[3/4]" />
      <div className="mt-3 h-3 w-1/2 shimmer" />
    </div>
  );
}
