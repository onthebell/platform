import { useAdminDashboard } from '@/hooks/useAdmin';
import {
  UsersIcon,
  DocumentTextIcon,
  FlagIcon,
  ExclamationTriangleIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import AdminLikeAnalytics from './AdminLikeAnalytics';
import { useState } from 'react';
import { authenticatedFetch } from '@/lib/utils/api';

interface StatCardProps {
  title: string;
  value: number;
  change?: number;
  changeLabel?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'green' | 'yellow' | 'red';
}

function StatCard({ title, value, change, changeLabel, icon: Icon, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500 text-blue-600 bg-blue-50',
    green: 'bg-green-500 text-green-600 bg-green-50',
    yellow: 'bg-yellow-500 text-yellow-600 bg-yellow-50',
    red: 'bg-red-500 text-red-600 bg-red-50',
  };

  const [iconBg, textColor, cardBg] = colorClasses[color].split(' ');

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
          {change !== undefined && changeLabel && (
            <p className="text-sm text-gray-500 mt-1">
              <span className={`${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {change >= 0 ? '+' : ''}
                {change}
              </span>{' '}
              {changeLabel}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${iconBg}`}>
          <Icon className={`w-6 h-6 text-white`} />
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { stats, loading, error, refetch } = useAdminDashboard();
  const [populating, setPopulating] = useState(false);
  const [populateMessage, setPopulateMessage] = useState<string | null>(null);

  const handlePopulateDemo = async () => {
    setPopulating(true);
    setPopulateMessage(null);
    try {
      const res = await authenticatedFetch('/api/admin/populate-demo', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setPopulateMessage('Demo data populated successfully!');
        refetch();
      } else {
        setPopulateMessage(data.error || 'Failed to populate demo data.');
      }
    } catch (err) {
      setPopulateMessage('Failed to populate demo data.');
    } finally {
      setPopulating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-400 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error loading dashboard</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">Overview of your community platform</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={refetch}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
          <button
            onClick={handlePopulateDemo}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60"
            disabled={populating}
            title="Delete all data except your user and repopulate with demo content"
          >
            {populating ? 'Populating...' : 'Populate Demo Data'}
          </button>
        </div>
      </div>
      {populateMessage && (
        <div
          className={`rounded p-3 mb-2 ${populateMessage.includes('success') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}
        >
          {populateMessage}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.users.total}
          change={stats.users.newThisWeek}
          changeLabel="this week"
          icon={UsersIcon}
          color="blue"
        />
        <StatCard
          title="Total Posts"
          value={stats.posts.total}
          change={stats.posts.newThisWeek}
          changeLabel="this week"
          icon={DocumentTextIcon}
          color="green"
        />
        <StatCard
          title="Pending Reports"
          value={stats.reports.pending}
          icon={FlagIcon}
          color="yellow"
        />
        <StatCard
          title="Suspended Users"
          value={stats.users.suspended}
          icon={ExclamationTriangleIcon}
          color="red"
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Stats */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Today's Activity</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">New Users</span>
              <span className="text-sm font-medium text-gray-900">{stats.users.newToday}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">New Posts</span>
              <span className="text-sm font-medium text-gray-900">{stats.posts.newToday}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Reports Resolved</span>
              <span className="text-sm font-medium text-gray-900">
                {stats.reports.resolvedToday}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Hidden Posts</span>
              <span className="text-sm font-medium text-gray-900">{stats.posts.hidden}</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
          </div>
          <div className="p-6">
            {stats.activity.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
            ) : (
              <div className="space-y-3">
                {stats.activity.slice(0, 5).map(activity => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <FlagIcon className="w-4 h-4 text-gray-400 mt-0.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500">
                        by {activity.adminName} •{' '}
                        {(() => {
                          if (!activity.createdAt) return 'Unknown';
                          try {
                            const date =
                              activity.createdAt instanceof Date
                                ? activity.createdAt
                                : new Date(activity.createdAt);
                            if (isNaN(date.getTime())) return 'Unknown';
                            return formatDistanceToNow(date, { addSuffix: true });
                          } catch {
                            return 'Unknown';
                          }
                        })()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Like Analytics */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Like Analytics</h3>
        </div>
        <div className="p-6">
          <AdminLikeAnalytics />
        </div>
      </div>
    </div>
  );
}
