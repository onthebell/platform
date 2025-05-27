'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/firebase/auth';
import { 
  HomeIcon, 
  MapPinIcon, 
  CalendarIcon, 
  ShoppingBagIcon,
  HeartIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  BuildingStorefrontIcon
} from '@heroicons/react/24/outline';
import { NotificationDropdown } from '@/components/notifications';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  requiresAuth?: boolean;
  verifiedOnly?: boolean;
}

const navigation: NavigationItem[] = [
  { name: 'Home', href: '/', icon: HomeIcon },
  { name: 'Map', href: '/map', icon: MapPinIcon },
  { name: 'Business', href: '/business', icon: BuildingStorefrontIcon },
  { name: 'Events', href: '/events', icon: CalendarIcon },
  { name: 'Marketplace', href: '/marketplace', icon: ShoppingBagIcon },
  { name: 'Community', href: '/community', icon: HeartIcon, verifiedOnly: true },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <BellIcon className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">OnTheBell</span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navigation.map((item) => {
              const canAccess = !item.requiresAuth || user;
              const canAccessVerified = !item.verifiedOnly || (user?.isVerified);
              
              if (!canAccess || !canAccessVerified) return null;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* User menu */}
          <div className="flex items-center space-x-4">
            {user && <NotificationDropdown />}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50"
                >
                  <UserCircleIcon className="h-6 w-6 text-gray-600" />
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-900">{user.displayName || 'User'}</p>
                    <p className="text-xs text-gray-500">
                      {user.isVerified ? 'Verified Resident' : 'Unverified User'}
                    </p>
                  </div>
                </button>
                
                {/* Dropdown Menu */}
                {mobileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                    <div className="py-1">
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      <Link
                        href="/business/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Manage Business
                      </Link>
                      <Link
                        href="/community/create"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Create Post
                      </Link>
                      <hr className="my-1" />
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/auth/signin"
                  className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Join OnTheBell
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-50"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => {
              const canAccess = !item.requiresAuth || user;
              const canAccessVerified = !item.verifiedOnly || (user?.isVerified);
              
              if (!canAccess || !canAccessVerified) return null;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
