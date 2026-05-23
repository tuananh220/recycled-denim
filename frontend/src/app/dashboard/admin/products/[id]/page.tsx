'use client';
import { use } from 'react';
import { AdminShell } from '@/components/dashboard/admin-shell';
import { ProductForm } from '@/components/dashboard/product-form';

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <AdminShell allow={['ADMIN']} title="Edit product" description="Update details, swap images, toggle visibility.">
      <ProductForm productId={id} />
    </AdminShell>
  );
}
