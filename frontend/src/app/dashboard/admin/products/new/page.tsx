'use client';
import { AdminShell } from '@/components/dashboard/admin-shell';
import { ProductForm } from '@/components/dashboard/product-form';

export default function NewProductPage() {
  return (
    <AdminShell allow={['ADMIN']} title="New product" description="Add a piece to your catalog.">
      <ProductForm />
    </AdminShell>
  );
}
