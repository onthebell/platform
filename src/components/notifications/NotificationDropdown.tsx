'use client';

import { Fragment } from 'react';
import { Popover, PopoverButton, Transition } from '@headlessui/react';
import { BellIcon } from '@heroicons/react/24/outline';
import { useFilteredNotifications } from '@/hooks/useFilteredNotifications';
import { NotificationItem } from './NotificationItem';
import Link from 'next/link';

export function NotificationDropdown() {
  const { notifications, loading, unreadCount, markAsRead, markAllAsRead } =
    useFilteredNotifications();

  return (
    <Popover className="relative">
      {() => (
        <>
          <PopoverButton className="relative p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-colors touch-target">
            <BellIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center font-medium min-w-[16px] sm:min-w-[20px]">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </PopoverButton>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel className="absolute right-0 z-50 mt-2 w-72 sm:w-80 lg:w-96 bg-white rounded-lg shadow-lg border border-gray-200 max-w-[calc(100vw-2rem)] sm:max-w-none">
              <div className="p-3 sm:p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium touch-target"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {unreadCount > 0 && (
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                    You have {unreadCount} unread notification{unreadCount === 1 ? '' : 's'}
                  </p>
                )}
              </div>

              <div className="max-h-80 sm:max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="p-4 text-center">
                    <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-xs sm:text-sm text-gray-600 mt-2">
                      Loading notifications...
                    </p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-4 sm:p-6 text-center">
                    <BellIcon className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs sm:text-sm text-gray-600">No notifications yet</p>
                    <p className="text-xs text-gray-500 mt-1">
                      You'll see updates about your posts and community activity here
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {notifications.map(notification => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={markAsRead}
                      />
                    ))}
                  </div>
                )}
              </div>

              {notifications.length > 0 && (
                <div className="p-3 border-t border-gray-200">
                  <Link
                    href="/notifications"
                    className="block w-full text-center text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium py-2 touch-target transition-colors"
                  >
                    View all notifications
                  </Link>
                </div>
              )}
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
}
