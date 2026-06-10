'use client';
import { useEffect, useState } from 'react';
import { AdminShell } from '@/components/dashboard/admin-shell';
import { DataTable } from '@/components/dashboard/data-table';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';

const STATUS_VI: Record<string, string> = {
  PENDING: 'Chờ', PROCESSING: 'Đang xử lý', SUCCEEDED: 'Thành công', FAILED: 'Thất bại',
};
const STATUS_COLOR: Record<string, string> = {
  PENDING:    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200',
  PROCESSING: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
  SUCCEEDED:  'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
  FAILED:     'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
};

export default function AdminTryOnLog() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { api.get('/tryon').then((r) => setRows(r.data)).catch(() => null); }, []);

  return (
    <AdminShell allow={['ADMIN']} title="Lịch sử AI Try-On" description="Tất cả lượt thử AI trên hệ thống.">
      <DataTable
        rows={rows}
        empty="Chưa có lượt try-on nào."
        columns={[
          {
            key: 'thumb', header: '', className: 'w-20',
            cell: (r: any) => r.resultUrl
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={r.resultUrl} alt="" className="w-14 h-14 object-cover" />
              : <div className="w-14 h-14 bg-muted" />,
          },
          { key: 'user',     header: 'Người dùng', cell: (r: any) => <span className="text-sm">{r.user?.email}</span> },
          { key: 'product',  header: 'Sản phẩm',   cell: (r: any) => r.product?.name ?? '—' },
          { key: 'provider', header: 'Nguồn AI',   cell: (r: any) => <span className="text-xs uppercase tracking-widest">{r.provider}</span> },
          {
            key: 'status', header: 'Trạng thái',
            cell: (r: any) => <span className={`text-xs uppercase tracking-widest px-2 py-0.5 ${STATUS_COLOR[r.status] || ''}`}>{STATUS_VI[r.status] || r.status}</span>,
          },
          { key: 'date', header: 'Ngày', cell: (r: any) => <span className="text-xs">{formatDate(r.createdAt)}</span> },
          {
            key: 'err', header: 'Lỗi',
            cell: (r: any) => <span className="text-xs text-red-500 line-clamp-1 max-w-xs">{r.errorMessage ?? ''}</span>,
          },
        ]}
      />
    </AdminShell>
  );
}
