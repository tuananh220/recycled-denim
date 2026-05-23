'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Users, Package, Receipt, Sparkles, DollarSign } from 'lucide-react';
import { AdminShell } from '@/components/dashboard/admin-shell';
import { api } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';

const RevenueChart = dynamic(() => import('@/components/dashboard/revenue-chart').then(m => m.RevenueChart), {
  ssr: false,
  loading: () => <div className="shimmer h-64" />,
});

export default function AdminOverview() {
  const [data, setData] = useState<any>(null);
  useEffect(() => { api.get('/analytics/overview').then(r => setData(r.data)).catch(() => null); }, []);

  return (
    <AdminShell allow={['ADMIN']} title="Overview" description="Performance snapshot — last 30 days.">
      {!data ? <div className="shimmer h-24" /> : (
        <div className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Stat icon={Users}     label="Users"            value={data.counts.users} />
            <Stat icon={Package}   label="Products"         value={data.counts.products} />
            <Stat icon={Receipt}   label="Orders"           value={data.counts.orders} />
            <Stat icon={Sparkles}  label="AI Try-ons (30d)" value={data.counts.tryOns} />
            <Stat icon={DollarSign} label="Revenue (30d)"   value={formatCurrency(data.revenue30d)} highlight />
          </div>

          <section className="border border-border p-6">
            <div className="flex justify-between items-baseline mb-4">
              <h2 className="text-xs uppercase tracking-widest">Revenue · last 14 days</h2>
              <span className="text-xs text-muted-foreground">USD</span>
            </div>
            <RevenueChart data={data.revenueByDay ?? []} />
          </section>

          <section>
            <h2 className="text-xs uppercase tracking-widest mb-4">Recent orders</h2>
            <ul className="divide-y divide-border border border-border">
              {data.recentOrders.map((o: any) => (
                <li key={o.id} className="py-3 px-4 grid grid-cols-4 text-sm items-center">
                  <span className="font-medium">{o.number}</span>
                  <span className="truncate">{o.user?.email}</span>
                  <span className="uppercase tracking-widest text-xs">{o.status}</span>
                  <span className="text-right">{formatCurrency(Number(o.total))}</span>
                </li>
              ))}
              {data.recentOrders.length === 0 && (
                <li className="p-12 text-center text-sm text-muted-foreground">No orders yet.</li>
              )}
            </ul>
          </section>
        </div>
      )}
    </AdminShell>
  );
}

function Stat({ icon: Icon, label, value, highlight }: { icon: any; label: string; value: any; highlight?: boolean }) {
  return (
    <div className={`border border-border p-4 ${highlight ? 'bg-indigo-900 text-denim-ecru' : ''}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-widest opacity-70">{label}</p>
        <Icon className="h-4 w-4 opacity-60" />
      </div>
      <p className="mt-3 text-2xl font-serif">{value}</p>
    </div>
  );
}
