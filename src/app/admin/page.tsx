'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import AdminDashboard from '@/components/admin/AdminDashboard';
import MigrationHandler from '@/components/admin/MigrationHandler';

export default function AdminPage() {
  return (
    <AdminLayout>
      <MigrationHandler />
      <AdminDashboard />
    </AdminLayout>
  );
}
