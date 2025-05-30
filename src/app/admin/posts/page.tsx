'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import AdminPosts from '@/components/admin/AdminPosts';

export default function AdminPostsPage() {
  return (
    <AdminLayout>
      <AdminPosts />
    </AdminLayout>
  );
}
