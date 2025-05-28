'use client';

import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { Notification } from '@/types';
import { cn } from '@/lib/utils';
import {
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

const notificationIcons = {
  info: InformationCircleIcon,
  success: CheckCircleIcon,
  warning: ExclamationTriangleIcon,
  error: XCircleIcon,
};

const notificationColors = {
  info: 'text-blue-500',
  success: 'text-green-500',
  warning: 'text-yellow-500',
  error: 'text-red-500',
};

export function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const Icon = notificationIcons[notification.type];
  const iconColor = notificationColors[notification.type];

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
  };

  const content = (
    <div
      className={cn(
        'flex items-start space-x-3 p-3 hover:bg-gray-50 transition-colors cursor-pointer',
        !notification.isRead && 'bg-blue-50'
      )}
      onClick={handleClick}
    >
      <div className={cn('flex-shrink-0 mt-0.5', iconColor)}>
        <Icon className="h-5 w-5" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p
              className={cn(
                'text-sm font-medium text-gray-900',
                !notification.isRead && 'font-semibold'
              )}
            >
              {notification.title}
            </p>
            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
            <p className="text-xs text-gray-500 mt-2">
              {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
            </p>
          </div>

          {!notification.isRead && (
            <div className="ml-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (notification.actionUrl) {
    return (
      <Link href={notification.actionUrl} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
