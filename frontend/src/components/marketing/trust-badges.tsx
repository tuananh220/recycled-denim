import { Truck, RotateCcw, Leaf, Lock } from 'lucide-react';

const items = [
  { Icon: Truck,    title: 'Miễn phí vận chuyển', desc: 'Cho đơn hàng từ 500.000 VNĐ' },
  { Icon: RotateCcw, title: 'Đổi trả 14 ngày',    desc: 'Không cần lý do' },
  { Icon: Leaf,     title: '100% Tái chế',         desc: 'Take-back nhận voucher 100k' },
  { Icon: Lock,     title: 'Thanh toán an toàn',   desc: 'SSL · COD · Momo · VNPay' },
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
