import { Truck, RotateCcw, Leaf, Lock } from 'lucide-react';

const items = [
  { Icon: Truck, title: 'Free shipping', desc: 'On orders over $200' },
  { Icon: RotateCcw, title: '60-day returns', desc: 'No questions asked' },
  { Icon: Leaf, title: 'Climate neutral', desc: 'Certified offset' },
  { Icon: Lock, title: 'Secure checkout', desc: 'SSL · Stripe · PayPal' },
];

export function TrustBadges() {
  return (
    <section className="border-y border-border">
      <div className="container py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
        {items.map(({ Icon, title, desc }) => (
          <div key={title} className="flex items-center gap-3 text-sm">
            <Icon className="h-5 w-5 text-denim-rust flex-shrink-0" />
            <div>
              <p className="font-medium">{title}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
