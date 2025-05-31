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
  HeartIcon,
  ChatBubbleLeftIcon,
  UserPlusIcon,
  BellIcon,
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
  like: HeartIcon,
  comment: ChatBubbleLeftIcon,
  follow: UserPlusIcon,
  new_post: BellIcon,
};

const notificationColors = {
  info: 'text-blue-500',
  success: 'text-green-500',
  warning: 'text-yellow-500',
  error: 'text-red-500',
  like: 'text-red-500',
  comment: 'text-blue-500',
  follow: 'text-green-500',
  new_post: 'text-indigo-500',
};

export function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const Icon = notificationIcons[notification.type];
  const iconColor = notificationColors[notification.type];

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
  };

  // Generate dynamic content based on notification type
  const getNotificationContent = () => {
    switch (notification.type) {
      case 'like':
        return {
          title: notification.actorName || 'Someone',
          message: `liked your post${notification.postTitle ? ` "${notification.postTitle}"` : ''}`,
          actionUrl: notification.postId ? `/community/${notification.postId}` : undefined,
        };
      case 'comment':
        return {
          title: notification.actorName || 'Someone',
          message: `commented on your post${notification.postTitle ? ` "${notification.postTitle}"` : ''}${
            notification.commentPreview ? `: "${notification.commentPreview}"` : ''
          }`,
          actionUrl: notification.postId
            ? `/community/${notification.postId}${notification.commentId ? `#comment-${notification.commentId}` : ''}`
            : undefined,
        };
      case 'follow':
        return {
          title: notification.actorName || 'Someone',
          message: 'started following you',
          actionUrl: notification.actorId ? `/profile/${notification.actorId}` : undefined,
        };
      case 'new_post':
        return {
          title: notification.actorName || 'New Post',
          message: `posted a new ${notification.postCategory || ''} post: "${notification.postTitle || 'Untitled'}"`,
          actionUrl: notification.postId ? `/community/${notification.postId}` : undefined,
        };
      default:
        return {
          title: notification.title,
          message: notification.message,
          actionUrl: notification.actionUrl,
        };
    }
  };

  const { title, message, actionUrl } = getNotificationContent();

  const content = (
    <div
      data-testid="notification-item"
      className={cn(
        'flex items-start space-x-2 sm:space-x-3 p-3 sm:p-4 hover:bg-gray-50 transition-colors cursor-pointer touch-target',
        !notification.isRead && 'bg-blue-50'
      )}
      onClick={handleClick}
    >
      <div className={cn('flex-shrink-0 mt-0.5', iconColor)}>
        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1 pr-2">
            <p
              className={cn(
                'text-xs sm:text-sm font-medium text-gray-900 leading-relaxed',
                !notification.isRead && 'font-semibold'
              )}
            >
              <span className="font-semibold">{title}</span> {message}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
            </p>
          </div>

          {!notification.isRead && (
            <div className="ml-1 sm:ml-2 flex-shrink-0">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (actionUrl) {
    return (
      <Link href={actionUrl} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
