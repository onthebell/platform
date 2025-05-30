'use client';

import CreateAdminUser from '@/components/admin/CreateAdminUser';

export default function CreateAdminPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">OnTheBell Admin Setup</h1>
          <p className="text-gray-600 mt-2">
            Create your first admin user to access the admin panel
          </p>
        </div>

        <CreateAdminUser />

        <div className="mt-8 text-center">
          <a href="/admin" className="text-blue-600 hover:text-blue-700 font-medium">
            Go to Admin Panel →
          </a>
        </div>
      </div>
    </div>
  );
}
