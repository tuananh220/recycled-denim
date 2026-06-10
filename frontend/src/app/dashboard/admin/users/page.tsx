'use client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import { AdminShell } from '@/components/dashboard/admin-shell';
import { DataTable } from '@/components/dashboard/data-table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api';
import { useAuth, type Role } from '@/store/auth';
import { formatDate } from '@/lib/utils';

const ROLES: Role[] = ['CUSTOMER', 'ADMIN', 'STAFF', 'DESIGNER', 'WAREHOUSE'];
const ROLE_VI: Record<string, string> = {
  CUSTOMER: 'Khách hàng', ADMIN: 'Admin', STAFF: 'Nhân viên',
  DESIGNER: 'Designer', WAREHOUSE: 'Kho',
};

export default function AdminUsersPage() {
  const [rows, setRows] = useState<any[]>([]);
  const { user: me } = useAuth();

  async function load() { const { data } = await api.get('/users', { params: { pageSize: 100 } }); setRows(data.data); }
  useEffect(() => { load(); }, []);

  async function setRole(id: string, role: Role) {
    try { await api.patch(`/users/${id}/role`, { role }); toast.success('Đã cập nhật vai trò'); load(); }
    catch { toast.error('Thất bại'); }
  }

  async function remove(id: string) {
    if (!confirm('Xóa người dùng này vĩnh viễn?')) return;
    try { await api.delete(`/users/${id}`); toast.success('Đã xóa'); load(); }
    catch { toast.error('Thất bại'); }
  }

  return (
    <AdminShell allow={['ADMIN']} title="Người dùng" description="Quản lý tài khoản và vai trò.">
      <DataTable
        rows={rows}
        empty="Chưa có user nào."
        columns={[
          { key: 'name', header: 'Họ tên', cell: (r: any) => <span className="font-medium">{r.name}</span> },
          { key: 'email', header: 'Email', cell: (r: any) => r.email },
          {
            key: 'role', header: 'Vai trò', className: 'w-44',
            cell: (r: any) => (
              <Select value={r.role} onValueChange={(v) => setRole(r.id, v as Role)} disabled={r.id === me?.id}>
                <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                <SelectContent>{ROLES.map((x) => <SelectItem key={x} value={x}>{ROLE_VI[x]}</SelectItem>)}</SelectContent>
              </Select>
            ),
          },
          {
            key: 'verified', header: 'Email', className: 'w-24',
            cell: (r: any) => (
              <span className={`text-xs px-2 py-0.5 ${r.emailVerified ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' : 'bg-muted text-muted-foreground'}`}>
                {r.emailVerified ? 'Đã XN' : 'Chưa XN'}
              </span>
            ),
          },
          { key: 'date', header: 'Tham gia', cell: (r: any) => <span className="text-xs">{formatDate(r.createdAt)}</span> },
          {
            key: 'actions', header: '', className: 'text-right w-16',
            cell: (r: any) => (
              <Button variant="ghost" size="icon" onClick={() => remove(r.id)} disabled={r.id === me?.id}>
                <Trash2 className="h-4 w-4" />
              </Button>
            ),
          },
        ]}
      />
    </AdminShell>
  );
}
