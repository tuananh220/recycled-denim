'use client';
import { use } from 'react';
import { AdminShell } from '@/components/dashboard/admin-shell';
import { PostForm } from '@/components/dashboard/post-form';

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <AdminShell allow={['ADMIN']} title="Edit story">
      <PostForm postId={id} />
    </AdminShell>
  );
}
