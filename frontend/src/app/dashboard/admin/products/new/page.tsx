'use client';
import { AdminShell } from '@/components/dashboard/admin-shell';
import { ProductForm } from '@/components/dashboard/product-form';

export default function NewProductPage() {
  return (
    <AdminShell allow={['ADMIN']} title="Sản phẩm mới" description="Thêm một sản phẩm 1-of-1 vào shop.">
      <ProductForm />
    </AdminShell>
  );
}
