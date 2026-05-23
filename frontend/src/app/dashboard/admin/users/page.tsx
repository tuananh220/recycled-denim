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

export default function AdminUsersPage() {
  const [rows, setRows] = useState<any[]>([]);
  const { user: me } = useAuth();

  async function load() { const { data } = await api.get('/users', { params: { pageSize: 100 } }); setRows(data.data); }
  useEffect(() => { load(); }, []);

  async function setRole(id: string, role: Role) {
    try { await api.patch(`/users/${id}/role`, { role }); toast.success('Role updated'); load(); }
    catch { toast.error('Failed'); }
  }

  async function remove(id: string) {
    if (!confirm('Delete this user permanently?')) return;
    try { await api.delete(`/users/${id}`); toast.success('Deleted'); load(); }
    catch { toast.error('Failed'); }
  }

  return (
    <AdminShell allow={['ADMIN']} title="Users" description="Manage accounts and roles.">
      <DataTable
        rows={rows}
        empty="No users."
        columns={[
          { key: 'name', header: 'Name', cell: (r: any) => <span className="font-medium">{r.name}</span> },
          { key: 'email', header: 'Email', cell: (r: any) => r.email },
          {
            key: 'role', header: 'Role', className: 'w-44',
            cell: (r: any) => (
              <Select value={r.role} onValueChange={(v) => setRole(r.id, v as Role)} disabled={r.id === me?.id}>
                <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                <SelectContent>{ROLES.map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
              </Select>
            ),
          },
          {
            key: 'verified', header: 'Email', className: 'w-20',
            cell: (r: any) => (
              <span className={`text-xs px-2 py-0.5 ${r.emailVerified ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' : 'bg-muted text-muted-foreground'}`}>
                {r.emailVerified ? '✓' : 'Pending'}
              </span>
            ),
          },
          { key: 'date', header: 'Joined', cell: (r: any) => <span className="text-xs">{formatDate(r.createdAt)}</span> },
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
