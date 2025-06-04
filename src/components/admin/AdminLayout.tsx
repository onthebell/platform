'use client';

import { ReactNode, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/hooks/useAdmin';
import { useAuth } from '@/lib/firebase/auth';
import {
  ChartBarIcon,
  UsersIcon,
  DocumentTextIcon,
  FlagIcon,
  CogIcon,
  HomeIcon,
  ArrowLeftOnRectangleIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

interface AdminLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: ChartBarIcon, permission: null },
  {
    name: 'Posts',
    href: '/admin/posts',
    icon: DocumentTextIcon,
    permission: 'manage_posts' as const,
  },
  { name: 'Users', href: '/admin/users', icon: UsersIcon, permission: 'manage_users' as const },
  {
    name: 'Reports',
    href: '/admin/reports',
    icon: FlagIcon,
    permission: 'manage_reports' as const,
  },
  {
    name: 'Verifications',
    href: '/admin/verifications',
    icon: ShieldCheckIcon,
    permission: 'manage_users' as const,
  },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const { user, loading, isAdmin, hasPermission } = useAdminAuth();
  const { signOut } = useAuth();

  useEffect(() => {
    // Only redirect after loading is complete
    if (!loading && (!user || !isAdmin)) {
      // Redirect to login with current path as return URL
      const currentPath = window.location.pathname;
      router.push(`/auth/signin?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [loading, user, isAdmin, router]);

  // Show loading during authentication check
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // Show nothing while redirecting
  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-100">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 bg-blue-600">
            <h1 className="text-xl font-bold text-white">OnTheBell Admin</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map(item => {
              const canAccess = !item.permission || hasPermission(item.permission);
              if (!canAccess) return null;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-blue-600 transition-colors"
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User info and logout */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {user?.displayName?.[0] || user?.email[0].toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.displayName || user?.email}
                </p>
                <p className="text-xs text-gray-500 capitalize">{user?.role.replace('_', ' ')}</p>
              </div>
            </div>

            <div className="space-y-1">
              <Link
                href="/"
                className="flex items-center px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <HomeIcon className="w-4 h-4 mr-2" />
                Back to Site
              </Link>
              <button
                onClick={async () => {
                  try {
                    await signOut();
                    router.push('/');
                  } catch (error) {
                    console.error('Error signing out:', error);
                  }
                }}
                className="flex items-center w-full px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeftOnRectangleIcon className="w-4 h-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
