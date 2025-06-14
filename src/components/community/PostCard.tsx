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
import { useLike } from '@/hooks/useLike';
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
  BookmarkIcon,
  ExclamationTriangleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartIconSolid,
  BookmarkIcon as BookmarkIconSolid,
} from '@heroicons/react/24/solid';
import ReportButton from '@/components/moderation/ReportButton';
import { FollowButton } from '@/components/ui/FollowButton';
import { useSavedJobs } from '@/hooks/useSavedJobs';
import JobDetailDrawer from '@/components/jobs/JobDetailDrawer';

// For testing purposes
export const __internal = {
  reloadPage: () => {
    window.location.reload();
  },
};

interface PostCardProps {
  post: CommunityPost;
  isCompact?: boolean;
  showAsJobCard?: boolean;
}

export default function PostCard({
  post,
  isCompact = false,
  showAsJobCard = false,
}: PostCardProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [showOptions, setShowOptions] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showJobDrawer, setShowJobDrawer] = useState(false);
  const optionsRef = useRef<HTMLDivElement>(null);
  const { count: commentCount } = useCommentCount(post.id);

  // Use the new like hook instead of local state
  const {
    isLiked,
    likeCount,
    isLoading: likeLoading,
    error: likeError,
    toggleLike,
    canLike,
  } = useLike(post.id, post.likes || 0);

  // Use saved jobs hook for job posts
  const { isJobSavedByUser, toggleSaveJob, canSaveJobs } = useSavedJobs();

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

  const handleLike = async () => {
    if (!canLike) {
      // Could show a toast or redirect to login
      console.log('Must be signed in to like posts');
      return;
    }

    await toggleLike();
  };

  const handleSaveJob = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!canSaveJobs) {
      console.log('Must be signed in to save jobs');
      return;
    }

    if (post.category === 'jobs') {
      await toggleSaveJob(post.id, post.title, post.category);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // For job posts, show drawer when showAsJobCard is true, otherwise navigate normally
    if (post.category === 'jobs' && showAsJobCard) {
      e.preventDefault();
      setShowJobDrawer(true);
      return;
    }
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
          {post.category === 'jobs' && showAsJobCard ? (
            <div className="block flex-1 cursor-pointer" onClick={handleCardClick}>
              <div className="p-3 sm:p-4">
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

                  {/* Event Date */}
                  {!showAsJobCard && post.eventDate && (
                    <span className="flex items-center sm:ml-3 text-blue-600">
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      {new Date(post.eventDate).toLocaleDateString()}
                    </span>
                  )}

                  {/* Request Urgency */}
                  {!showAsJobCard && post.urgency && (
                    <span
                      className={`flex items-center sm:ml-3 font-medium ${
                        post.urgency === 'high'
                          ? 'text-red-600'
                          : post.urgency === 'medium'
                            ? 'text-yellow-600'
                            : 'text-green-600'
                      }`}
                    >
                      <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                      {post.urgency.charAt(0).toUpperCase() + post.urgency.slice(1)}
                    </span>
                  )}

                  {/* Item Condition */}
                  {!showAsJobCard && post.condition && (
                    <span className="flex items-center sm:ml-3 text-gray-600">
                      <span className="h-3 w-3 mr-1 text-center">•</span>
                      {post.condition.replace('_', ' ')}
                    </span>
                  )}

                  {/* Offer Duration */}
                  {!showAsJobCard && post.duration && (
                    <span className="flex items-center sm:ml-3 text-purple-600">
                      <ClockIcon className="h-3 w-3 mr-1" />
                      {post.duration}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <Link href={`/community/${post.id}`} className="block flex-1">
              <div className="p-3 sm:p-4">
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

                  {/* Event Date */}
                  {!showAsJobCard && post.eventDate && (
                    <span className="flex items-center sm:ml-3 text-blue-600">
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      {new Date(post.eventDate).toLocaleDateString()}
                    </span>
                  )}

                  {/* Request Urgency */}
                  {!showAsJobCard && post.urgency && (
                    <span
                      className={`flex items-center sm:ml-3 font-medium ${
                        post.urgency === 'high'
                          ? 'text-red-600'
                          : post.urgency === 'medium'
                            ? 'text-yellow-600'
                            : 'text-green-600'
                      }`}
                    >
                      <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                      {post.urgency.charAt(0).toUpperCase() + post.urgency.slice(1)}
                    </span>
                  )}

                  {/* Item Condition */}
                  {!showAsJobCard && post.condition && (
                    <span className="flex items-center sm:ml-3 text-gray-600">
                      <span className="h-3 w-3 mr-1 text-center">•</span>
                      {post.condition.replace('_', ' ')}
                    </span>
                  )}

                  {/* Offer Duration */}
                  {!showAsJobCard && post.duration && (
                    <span className="flex items-center sm:ml-3 text-purple-600">
                      <ClockIcon className="h-3 w-3 mr-1" />
                      {post.duration}
                    </span>
                  )}

                  {/* Offer Duration */}
                  {(post.category === 'deals' || post.category === 'services') && post.duration && (
                    <span className="flex items-center sm:ml-3 text-purple-600">
                      <ClockIcon className="h-3 w-3 mr-1" />
                      {post.duration}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          )}
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

        {/* Job Detail Drawer for compact view */}
        {post.category === 'jobs' && showAsJobCard && (
          <JobDetailDrawer
            isOpen={showJobDrawer}
            onClose={() => setShowJobDrawer(false)}
            job={post}
          />
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative">
        {post.category === 'jobs' && showAsJobCard ? (
          <div className="block cursor-pointer" onClick={handleCardClick}>
            {post.images && post.images.length > 0 && (
              <div className="relative h-40 sm:h-48 w-full">
                <Image src={imageUrl} alt={post.title} fill className="object-cover" />
                <div className="absolute top-2 right-2 flex gap-2">
                  {post.category && (
                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                      {post.category}
                    </span>
                  )}
                </div>
              </div>
            )}
            <div className="p-3 sm:p-4">
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

              {/* Job-specific information */}
              {post.category === 'jobs' && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {post.startDate && (
                      <div className="flex items-center">
                        <CalendarIcon className="h-3.5 w-3.5 mr-1 text-blue-600" />
                        <span className="font-medium text-blue-900">Start: </span>
                        <span className="text-gray-700">
                          {formatShortDate(new Date(post.startDate))}
                        </span>
                      </div>
                    )}
                    {post.employerType && (
                      <div className="flex items-center">
                        <span className="font-medium text-blue-900">Posted by: </span>
                        <span className="text-gray-700 capitalize">{post.employerType}</span>
                      </div>
                    )}
                    {post.workType && (
                      <div className="flex items-center">
                        <span className="font-medium text-blue-900">Type: </span>
                        <span className="text-gray-700 capitalize">{post.workType}</span>
                      </div>
                    )}
                    {post.location && (
                      <div className="flex items-center">
                        <MapPinIcon className="h-3.5 w-3.5 mr-1 text-blue-600" />
                        <span className="font-medium text-blue-900">Location: </span>
                        <span className="text-gray-700">{post.location.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Event-specific information */}
              {!showAsJobCard &&
                (post.eventDate || post.eventEndDate || post.eventType || post.capacity) && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {post.eventDate && (
                        <div className="flex items-center">
                          <CalendarIcon className="h-3.5 w-3.5 mr-1 text-blue-600" />
                          <span className="font-medium text-blue-900">Start: </span>
                          <span className="text-gray-700">
                            {new Date(post.eventDate).toLocaleDateString()} at{' '}
                            {new Date(post.eventDate).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      )}
                      {post.eventEndDate && (
                        <div className="flex items-center">
                          <CalendarIcon className="h-3.5 w-3.5 mr-1 text-blue-600" />
                          <span className="font-medium text-blue-900">End: </span>
                          <span className="text-gray-700">
                            {new Date(post.eventEndDate).toLocaleDateString()} at{' '}
                            {new Date(post.eventEndDate).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      )}
                      {post.eventType && (
                        <div className="flex items-center">
                          <span className="font-medium text-blue-900">Type: </span>
                          <span className="text-gray-700 capitalize">
                            {post.eventType.replace('_', ' ')}
                          </span>
                        </div>
                      )}
                      {post.capacity && (
                        <div className="flex items-center">
                          <span className="font-medium text-blue-900">Capacity: </span>
                          <span className="text-gray-700">{post.capacity} people</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              {/* Help Request-specific information */}
              {!showAsJobCard &&
                (post.urgency || post.deadline || post.budget || post.helpType) && (
                  <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {post.urgency && (
                        <div className="flex items-center">
                          <ExclamationTriangleIcon
                            className={`h-3.5 w-3.5 mr-1 ${
                              post.urgency === 'high'
                                ? 'text-red-600'
                                : post.urgency === 'medium'
                                  ? 'text-yellow-600'
                                  : 'text-green-600'
                            }`}
                          />
                          <span className="font-medium text-yellow-900">Urgency: </span>
                          <span
                            className={`font-medium ${
                              post.urgency === 'high'
                                ? 'text-red-700'
                                : post.urgency === 'medium'
                                  ? 'text-yellow-700'
                                  : 'text-green-700'
                            }`}
                          >
                            {post.urgency.charAt(0).toUpperCase() + post.urgency.slice(1)}
                          </span>
                        </div>
                      )}
                      {post.deadline && (
                        <div className="flex items-center">
                          <ClockIcon className="h-3.5 w-3.5 mr-1 text-yellow-600" />
                          <span className="font-medium text-yellow-900">Deadline: </span>
                          <span className="text-gray-700">
                            {new Date(post.deadline).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {post.budget && (
                        <div className="flex items-center">
                          <span className="font-medium text-yellow-900">Budget: </span>
                          <span className="text-green-700 font-medium">${post.budget}</span>
                        </div>
                      )}
                      {post.helpType && (
                        <div className="flex items-center">
                          <span className="font-medium text-yellow-900">Type: </span>
                          <span className="text-gray-700 capitalize">
                            {post.helpType.replace('_', ' ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              {/* Marketplace/Sale-specific information */}
              {!showAsJobCard &&
                (post.condition || post.brand || post.deliveryAvailable || post.pickupOnly) && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {post.condition && (
                        <div className="flex items-center">
                          <span className="font-medium text-green-900">Condition: </span>
                          <span className="text-gray-700 capitalize">
                            {post.condition.replace('_', ' ')}
                          </span>
                        </div>
                      )}
                      {post.brand && (
                        <div className="flex items-center">
                          <span className="font-medium text-green-900">Brand: </span>
                          <span className="text-gray-700">{post.brand}</span>
                        </div>
                      )}
                      {post.deliveryAvailable && (
                        <div className="flex items-center">
                          <span className="text-green-700 font-medium">✓ Delivery Available</span>
                        </div>
                      )}
                      {post.pickupOnly && (
                        <div className="flex items-center">
                          <span className="text-orange-700 font-medium">📍 Pickup Only</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              {/* Offer/Deal-specific information */}
              {!showAsJobCard && (post.duration || post.availability || post.termsConditions) && (
                <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {post.duration && (
                      <div className="flex items-center">
                        <ClockIcon className="h-3.5 w-3.5 mr-1 text-purple-600" />
                        <span className="font-medium text-purple-900">Duration: </span>
                        <span className="text-gray-700">{post.duration}</span>
                      </div>
                    )}
                    {post.availability && (
                      <div className="flex items-center">
                        <span className="font-medium text-purple-900">Available: </span>
                        <span className="text-gray-700 capitalize">
                          {post.availability.replace('_', ' ')}
                        </span>
                      </div>
                    )}
                    {post.termsConditions && (
                      <div className="col-span-1 sm:col-span-2">
                        <span className="font-medium text-purple-900">Terms: </span>
                        <span className="text-gray-700">{post.termsConditions}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Announcement-specific information */}
              {!showAsJobCard && (post.announcementType || post.importance || post.expiryDate) && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {post.announcementType && (
                      <div className="flex items-center">
                        <span className="font-medium text-gray-900">Type: </span>
                        <span className="text-gray-700 capitalize">{post.announcementType}</span>
                      </div>
                    )}
                    {post.importance && (
                      <div className="flex items-center">
                        <ExclamationTriangleIcon
                          className={`h-3.5 w-3.5 mr-1 ${
                            post.importance === 'high'
                              ? 'text-red-600'
                              : post.importance === 'medium'
                                ? 'text-yellow-600'
                                : 'text-gray-600'
                          }`}
                        />
                        <span className="font-medium text-gray-900">Importance: </span>
                        <span
                          className={`font-medium ${
                            post.importance === 'high'
                              ? 'text-red-700'
                              : post.importance === 'medium'
                                ? 'text-yellow-700'
                                : 'text-gray-700'
                          }`}
                        >
                          {post.importance.charAt(0).toUpperCase() + post.importance.slice(1)}
                        </span>
                      </div>
                    )}
                    {post.expiryDate && (
                      <div className="flex items-center">
                        <ClockIcon className="h-3.5 w-3.5 mr-1 text-gray-600" />
                        <span className="font-medium text-gray-900">Expires: </span>
                        <span className="text-gray-700">
                          {new Date(post.expiryDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

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
          </div>
        ) : (
          <Link href={`/community/${post.id}`} className="block">
            {post.images && post.images.length > 0 && (
              <div className="relative h-40 sm:h-48 w-full">
                <Image src={imageUrl} alt={post.title} fill className="object-cover" />
                <div className="absolute top-2 right-2 flex gap-2">
                  {post.category && (
                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                      {post.category}
                    </span>
                  )}
                </div>
              </div>
            )}
            <div className="p-3 sm:p-4">
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
        )}

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
            disabled={likeLoading}
          >
            {isLiked ? (
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
          {post.category === 'jobs' && user && (
            <button
              onClick={handleSaveJob}
              className="flex items-center ml-4 hover:text-yellow-500 focus:outline-none transition-colors"
              aria-label={isJobSavedByUser(post.id) ? 'Unsave job' : 'Save job'}
            >
              {isJobSavedByUser(post.id) ? (
                <BookmarkIconSolid className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
              ) : (
                <BookmarkIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </button>
          )}
          {!isOwner && user && (
            <ReportButton
              contentType="post"
              contentId={post.id}
              contentAuthorId={post.authorId}
              size="sm"
              className="ml-4"
            />
          )}
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-sm font-medium">
            <Link
              href={`/profile/${post.authorId}`}
              className="text-blue-600 hover:underline transition-colors"
            >
              <span className="truncate">{post.authorName}</span>
            </Link>
          </div>
          {!isOwner && user && (
            <FollowButton entityId={post.authorId} entityType="user" variant="icon-only" />
          )}
        </div>
      </div>

      {/* Job Detail Drawer */}
      {post.category === 'jobs' && showAsJobCard && (
        <JobDetailDrawer
          isOpen={showJobDrawer}
          onClose={() => setShowJobDrawer(false)}
          job={post}
        />
      )}
    </div>
  );
}
