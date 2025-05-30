export default function TestAdminPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Portal Test Dashboard</h1>
          <p className="text-gray-600 mt-2">Test admin functionality and permissions</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <a
              href="/create-admin"
              className="inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 mr-3"
            >
              Create Admin User
            </a>
            <a
              href="/seed-data"
              className="inline-block px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 mr-3"
            >
              Seed Test Data
            </a>
            <a
              href="/admin"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Go to Admin Panel
            </a>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Status</h2>
          <div className="space-y-3">
            <div className="p-3 border rounded">
              <span className="font-medium">Admin Portal</span>
              <p className="text-sm text-gray-600">✅ Accessible at /admin</p>
            </div>
            <div className="p-3 border rounded">
              <span className="font-medium">Dashboard API</span>
              <p className="text-sm text-gray-600">✅ Working with fallback data</p>
            </div>
            <div className="p-3 border rounded">
              <span className="font-medium">Firebase Integration</span>
              <p className="text-sm text-gray-600">✅ Client SDK fallback active</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
