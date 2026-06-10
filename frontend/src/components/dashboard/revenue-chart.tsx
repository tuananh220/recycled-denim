'use client';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface Row { day: string; revenue: number }

export function RevenueChart({ data }: { data: Row[] }) {
  const normalized = data.map((d) => ({
    day: new Date(d.day).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
    revenue: Number(d.revenue) || 0,
  }));

  if (normalized.length === 0) {
    return <div className="h-64 grid place-items-center text-sm text-muted-foreground">Chưa có dữ liệu doanh thu.</div>;
  }

  const fmtVND = (v: number) =>
    v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}tr`
    : v >= 1_000   ? `${(v / 1_000).toFixed(0)}k`
    : `${v}`;

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
          <YAxis tickLine={false} axisLine={false} className="text-xs" width={50} tickFormatter={fmtVND} />
          <Tooltip
            contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', fontSize: 12 }}
            formatter={(v: any) => [`${Number(v).toLocaleString('vi-VN')} VNĐ`, 'Doanh thu']}
          />
          <Area type="monotone" dataKey="revenue" stroke="#2d4a6b" strokeWidth={2} fill="url(#rev)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
