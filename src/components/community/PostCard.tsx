'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { formatRelativeTime, formatShortDate } from '@/lib/utils';
import { CommunityPost } from '@/types';
import { useAuth } from '@/lib/firebase/auth';
import { deletePost } from '@/lib/firebase/firestore';
import { useCommentCount } from '@/hooks/useCommentCount';
import {
  MapPinIcon,
  CalendarIcon,
  TagIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  ShareIcon,
  PencilIcon,
  TrashIcon,
  EllipsisVerticalIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

// For testing purposes
export const __internal = {
  reloadPage: () => {
    window.location.reload();
  },
};

interface PostCardProps {
  post: CommunityPost;
  isCompact?: boolean;
}

export default function PostCard({ post, isCompact = false }: PostCardProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showOptions, setShowOptions] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const optionsRef = useRef<HTMLDivElement>(null);
  const { count: commentCount } = useCommentCount(post.id);

  const isOwner = user && user.id === post.authorId;

  // Close options menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target as Node)) {
        setShowOptions(false);
      }
    };

    if (showOptions) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showOptions]);

  const handleLike = () => {
    if (liked) {
      setLikeCount(prev => prev - 1);
    } else {
      setLikeCount(prev => prev + 1);
    }
    setLiked(!liked);
  };

  const handleCardClick = () => {
    router.push(`/community/${post.id}`);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.description,
          url: `${window.location.origin}/community/${post.id}`,
        });
      } catch (error) {
        console.error('Error sharing post:', error);
      }
    }
  };

  const handleEdit = () => {
    router.push(`/community/edit/${post.id}`);
    setShowOptions(false);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    setIsDeleting(true);
    setShowOptions(false);
    try {
      await deletePost(post.id);
      // Instead of directly reloading, use the function which can be mocked in tests
      __internal.reloadPage();
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const postDate = new Date(post.createdAt);
  const imageUrl =
    post.images && post.images.length > 0 ? post.images[0] : '/placeholder-image.jpg';

  if (isCompact) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
        <div className="flex">
          <Link href={`/community/${post.id}`} className="block flex-1">
            <div className="p-3 sm:p-4" onClick={handleCardClick}>
              <div className="flex justify-between items-start">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 line-clamp-1 flex-1 mr-2">
                  {post.title}
                </h3>
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {formatRelativeTime(postDate)}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">
                {post.description}
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center mt-2 sm:mt-3 text-xs text-gray-500 space-y-1 sm:space-y-0">
                <span className="flex items-center">
                  <TagIcon className="h-3 w-3 mr-1" />
                  {post.category}
                </span>
                {post.type && (
                  <span className="flex items-center sm:ml-3">
                    <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs">
                      {post.type}
                    </span>
                  </span>
                )}
                {post.location && (
                  <span className="flex items-center sm:ml-3">
                    <MapPinIcon className="h-3 w-3 mr-1" />
                    <span className="truncate">{post.location.address}</span>
                  </span>
                )}
                {post.price && (
                  <span className="flex items-center sm:ml-3 font-medium text-green-600">
                    ${post.price} {post.currency || 'AUD'}
                  </span>
                )}
              </div>
            </div>
          </Link>
          {isOwner && (
            <div className="relative p-1 sm:p-2">
              <button
                onClick={() => setShowOptions(!showOptions)}
                className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                disabled={isDeleting}
                aria-label="Post options"
              >
                <EllipsisVerticalIcon className="h-4 w-4" />
              </button>
              {showOptions && (
                <div
                  ref={optionsRef}
                  className="absolute right-1 sm:right-2 top-8 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-10 min-w-[120px]"
                >
                  <button
                    onClick={handleEdit}
                    className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-gray-100 disabled:opacity-50 transition-colors"
                  >
                    <TrashIcon className="h-4 w-4 mr-2" />
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative">
        <Link href={`/community/${post.id}`} className="block">
          {post.images && post.images.length > 0 && (
            <div className="relative h-40 sm:h-48 w-full" onClick={handleCardClick}>
              <Image src={imageUrl} alt={post.title} fill className="object-cover" />
              <div className="absolute top-2 right-2 flex gap-2">
                {post.category && (
                  <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                    {post.category}
                  </span>
                )}
                {post.type && (
                  <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">
                    {post.type}
                  </span>
                )}
              </div>
            </div>
          )}
          <div className="p-3 sm:p-4" onClick={handleCardClick}>
            <div className="flex justify-between items-start">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex-1 mr-2">
                {post.title}
              </h3>
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {formatRelativeTime(postDate)}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-2 line-clamp-3">{post.description}</p>

            {post.price && (
              <div className="mt-3">
                <span className="text-lg font-bold text-green-600">
                  ${post.price} {post.currency || 'AUD'}
                </span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center mt-3 sm:mt-4 text-xs text-gray-500 space-y-1 sm:space-y-0">
              {post.location && (
                <span className="flex items-center sm:mr-3">
                  <MapPinIcon className="h-3.5 w-3.5 mr-1" />
                  <span className="truncate">{post.location.address}</span>
                </span>
              )}
              <span className="flex items-center">
                <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                {formatShortDate(postDate)}
              </span>
            </div>

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {post.tags.slice(0, 3).map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    {tag}
                  </span>
                ))}
                {post.tags.length > 3 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                    +{post.tags.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>
        </Link>

        {isOwner && (
          <div className="absolute top-2 left-2">
            <div className="relative">
              <button
                onClick={() => setShowOptions(!showOptions)}
                className="p-1.5 sm:p-2 bg-white/80 backdrop-blur-sm text-gray-600 hover:text-gray-800 rounded-full hover:bg-white/90 shadow-sm transition-colors"
                disabled={isDeleting}
                aria-label="Post options"
              >
                <EllipsisVerticalIcon className="h-4 w-4" />
              </button>
              {showOptions && (
                <div
                  ref={optionsRef}
                  className="absolute left-0 top-8 sm:top-10 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-10 min-w-[120px]"
                >
                  <button
                    onClick={handleEdit}
                    className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-gray-100 disabled:opacity-50 transition-colors"
                  >
                    <TrashIcon className="h-4 w-4 mr-2" />
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="px-3 sm:px-4 py-2 sm:py-3 border-t border-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
        <div className="flex items-center text-sm text-gray-500">
          <button
            onClick={handleLike}
            className="flex items-center mr-4 text-gray-500 hover:text-red-500 focus:outline-none transition-colors"
            aria-label="Like post"
          >
            {liked ? (
              <HeartIconSolid className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 mr-1" />
            ) : (
              <HeartIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1" />
            )}
            <span className="text-xs sm:text-sm">{likeCount}</span>
          </button>
          <Link
            href={`/community/${post.id}#comments`}
            className="flex items-center mr-4 hover:text-blue-500 transition-colors"
          >
            <ChatBubbleLeftIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1" />
            <span className="text-xs sm:text-sm">{commentCount}</span>
          </Link>
          <button
            onClick={handleShare}
            className="flex items-center hover:text-blue-500 focus:outline-none transition-colors"
            aria-label="Share post"
          >
            <ShareIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>
        <div className="text-sm font-medium">
          <Link
            href={`/profile/${post.authorId}`}
            className="text-blue-600 hover:underline transition-colors"
          >
            <span className="truncate">{post.authorName}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
