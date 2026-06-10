'use client';
import { use } from 'react';
import { AdminShell } from '@/components/dashboard/admin-shell';
import { ProductForm } from '@/components/dashboard/product-form';

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <AdminShell allow={['ADMIN']} title="Sửa sản phẩm" description="Cập nhật thông tin, ảnh, trạng thái hiển thị.">
      <ProductForm productId={id} />
    </AdminShell>
  );
}
