'use client';
import { AdminShell } from '@/components/dashboard/admin-shell';
import { PostForm } from '@/components/dashboard/post-form';

export default function NewPostPage() {
  return (
    <AdminShell allow={['ADMIN']} title="New story" description="Draft an editorial piece in Markdown.">
      <PostForm />
    </AdminShell>
  );
}
