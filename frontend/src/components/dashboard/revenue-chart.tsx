'use client';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface Row { day: string; revenue: number }

export function RevenueChart({ data }: { data: Row[] }) {
  const normalized = data.map((d) => ({
    day: new Date(d.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    revenue: Number(d.revenue) || 0,
  }));

  if (normalized.length === 0) {
    return <div className="h-64 grid place-items-center text-sm text-muted-foreground">No revenue data yet.</div>;
  }

  return (
    <div className="h-64">
      <ResponsiveContainer>
        <AreaChart data={normalized} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2d4a6b" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#2d4a6b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="day" tickLine={false} axisLine={false} className="text-xs" />
          <YAxis tickLine={false} axisLine={false} className="text-xs" width={50} tickFormatter={(v) => `$${v}`} />
          <Tooltip
            contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', fontSize: 12 }}
            formatter={(v: any) => [`$${Number(v).toFixed(2)}`, 'Revenue']}
          />
          <Area type="monotone" dataKey="revenue" stroke="#2d4a6b" strokeWidth={2} fill="url(#rev)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
