'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
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
  BuildingStorefrontIcon,
  GiftIcon,
  UserGroupIcon,
  BriefcaseIcon,
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
  { name: 'Deals', href: '/deals', icon: GiftIcon },
  { name: 'Events', href: '/events', icon: CalendarIcon },
  { name: 'Jobs', href: '/jobs', icon: BriefcaseIcon },
  { name: 'Marketplace', href: '/marketplace', icon: ShoppingBagIcon },
  { name: 'Community', href: '/community', icon: HeartIcon, verifiedOnly: true },
  { name: 'Discover', href: '/discover', icon: UserGroupIcon, requiresAuth: true },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [userMenuOpen]);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  return (
    <nav
      className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40"
      role="navigation"
    >
      <div className="mx-auto max-w-8xl px-3 sm:px-4 lg:px-6 xl:px-8">
        <div className="flex justify-between h-14 sm:h-16">
          {/* Logo and brand */}
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="flex items-center space-x-1 sm:space-x-2">
              <BellIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
              <span className="text-lg sm:text-xl font-bold text-gray-900 whitespace-nowrap">
                OnTheBell
              </span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex md:items-center md:space-x-1 lg:space-x-2 xl:space-x-4 flex-1 justify-center max-w-3xl">
            {navigation.map(item => {
              const canAccess = !item.requiresAuth || user;
              const canAccessVerified = !item.verifiedOnly || user?.isVerified;
              const isActive = pathname === item.href;

              if (!canAccess || !canAccessVerified) return null;

              return (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.href)}
                  className={`flex items-center space-x-1 px-2 lg:px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden xl:inline">{item.name}</span>
                </button>
              );
            })}
          </div>

          {/* User menu */}
          <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 flex-shrink-0">
            {user && <NotificationDropdown />}
            {/* Desktop user dropdown (hidden on mobile) */}
            {user && (
              <div className="relative hidden md:block" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-1 sm:space-x-2 p-1.5 sm:p-2 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <UserCircleIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600 flex-shrink-0" />
                  <div className="hidden sm:block text-left min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-20 lg:max-w-24 xl:max-w-32">
                      {user.displayName || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user.isVerified ? 'Verified' : 'Unverified'}
                    </p>
                  </div>
                </button>

                {/* User Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-44 sm:w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                    <div className="py-1">
                      <Link
                        href="/profile"
                        className="block px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      <Link
                        href="/business/dashboard"
                        className="block px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Manage Business
                      </Link>
                      <Link
                        href="/community/create"
                        className="block px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Create Post
                      </Link>
                      <hr className="my-1 border-gray-200" />
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-red-600 hover:bg-gray-50 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!user && (
              <div className="flex items-center space-x-1 sm:space-x-3">
                <Link
                  href="/auth/signin"
                  className="text-xs sm:text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors px-1 sm:px-2 py-1 rounded"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-blue-600 text-white px-2 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium hover:bg-blue-700 transition-colors whitespace-nowrap"
                >
                  <span className="hidden sm:inline">Join OnTheBell</span>
                  <span className="sm:hidden">Join</span>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors ml-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Close main menu' : 'Open main menu'}
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              ) : (
                <Bars3Icon className="h-5 w-5 sm:h-6 sm:w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {/* Navigation items */}
            {navigation.map(item => {
              const canAccess = !item.requiresAuth || user;
              const canAccessVerified = !item.verifiedOnly || user?.isVerified;
              const isActive = pathname === item.href;

              if (!canAccess || !canAccessVerified) return null;

              return (
                <button
                  key={item.name}
                  onClick={() => {
                    handleNavigation(item.href);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium w-full text-left transition-colors ${
                    isActive
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </button>
              );
            })}

            {/* Mobile Sign Out button for logged-in users */}
            {user && (
              <>
                <hr className="my-2 border-gray-200" />
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-gray-900">{user.displayName || 'User'}</p>
                  <p className="text-xs text-gray-500">
                    {user.isVerified ? 'Verified Member' : 'Unverified'}
                  </p>
                </div>
                <Link
                  href="/profile"
                  className="flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <UserCircleIcon className="h-5 w-5" />
                  <span>Profile</span>
                </Link>
                <Link
                  href="/business/dashboard"
                  className="flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <BuildingStorefrontIcon className="h-5 w-5" />
                  <span>Manage Business</span>
                </Link>
                <Link
                  href="/community/create"
                  className="flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <HeartIcon className="h-5 w-5" />
                  <span>Create Post</span>
                </Link>
                <hr className="my-2 border-gray-200" />
                <button
                  onClick={() => {
                    handleSignOut();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium text-red-600 hover:bg-gray-50 transition-colors w-full text-left"
                >
                  <XMarkIcon className="h-5 w-5" />
                  <span>Sign Out</span>
                </button>
              </>
            )}

            {/* Sign in/up buttons for mobile when not logged in */}
            {!user && (
              <>
                <hr className="my-2 border-gray-200" />
                <Link
                  href="/auth/signin"
                  className="flex items-center justify-center px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="flex items-center justify-center px-3 py-3 rounded-md text-base font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Join OnTheBell
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
