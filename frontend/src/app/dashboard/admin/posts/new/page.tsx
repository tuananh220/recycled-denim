'use client';
import { AdminShell } from '@/components/dashboard/admin-shell';
import { PostForm } from '@/components/dashboard/post-form';

export default function NewPostPage() {
  return (
    <AdminShell allow={['ADMIN']} title="Bài viết mới" description="Viết bài bằng Markdown.">
      <PostForm />
    </AdminShell>
  );
}
