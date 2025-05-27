'use client';

import { Fragment } from 'react';
import { Popover, Transition } from '@headlessui/react';
import { BellIcon } from '@heroicons/react/24/outline';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationItem } from './NotificationItem';

export function NotificationDropdown() {
  const { notifications, loading, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  return (
    <Popover className="relative">
      {() => (
        <>
          <Popover.Button className="relative p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-colors">
            <BellIcon className="h-6 w-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Popover.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel className="absolute right-0 z-50 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-lg border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                
                {unreadCount > 0 && (
                  <p className="text-sm text-gray-600 mt-1">
                    You have {unreadCount} unread notification{unreadCount === 1 ? '' : 's'}
                  </p>
                )}
              </div>

              <div className="max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="p-4 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-sm text-gray-600 mt-2">Loading notifications...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-6 text-center">
                    <BellIcon className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">No notifications yet</p>
                    <p className="text-xs text-gray-500 mt-1">
                      You&apos;ll see updates about your posts and community activity here
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {notifications.map((notification) => (
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
                  <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium py-1">
                    View all notifications
                  </button>
                </div>
              )}
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
}
