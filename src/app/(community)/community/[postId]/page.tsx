'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth';
import { getPostById } from '@/lib/firebase/firestore';
import { CommunityPost } from '@/types';
import {
  MapPinIcon,
  ClockIcon,
  TagIcon,
  UserIcon,
  ArrowLeftIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  ShoppingBagIcon,
  GiftIcon,
  SpeakerWaveIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon, ShareIcon } from '@heroicons/react/24/solid';
import { HeartIcon as HeartIconOutline } from '@heroicons/react/24/outline';
import { CommentsSection } from '@/components/community/CommentsSection';
import { useLike } from '@/hooks/useLike';
import ReportButton from '@/components/moderation/ReportButton';

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [post, setPost] = useState<CommunityPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Like functionality
  const {
    isLiked,
    likeCount,
    isLoading: likeLoading,
    toggleLike,
    canLike,
  } = useLike(post?.id || '', post?.likes || 0);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const postData = await getPostById(params.postId as string);
        if (postData) {
          setPost(postData);
        } else {
          setError('Post not found');
        }
      } catch (err) {
        console.error('Error fetching post:', err);
        setError('Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    if (params.postId) {
      fetchPost();
    }
  }, [params.postId]);

  const handleContactSeller = () => {
    if (!user) {
      router.push('/auth/signin');
      return;
    }
    // Here you would implement contact functionality
    // For now, we'll just show an alert
    alert('Contact functionality will be implemented with messaging system');
  };

  const handleLike = async () => {
    if (!canLike) {
      router.push('/auth/signin');
      return;
    }

    await toggleLike();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          text: post?.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share failed:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-AU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      marketplace: 'bg-blue-100 text-blue-800',
      free_items: 'bg-green-100 text-green-800',
      events: 'bg-purple-100 text-purple-800',
      community: 'bg-gray-100 text-gray-800',
      help_requests: 'bg-yellow-100 text-yellow-800',
      deals: 'bg-red-100 text-red-800',
      food: 'bg-orange-100 text-orange-800',
      services: 'bg-indigo-100 text-indigo-800',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-3 sm:px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-sm sm:text-base text-gray-600">Loading post...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-3 sm:px-4">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Post Not Found</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-6">
            {error || "The post you're looking for doesn't exist."}
          </p>
          <button
            onClick={() => router.push('/community')}
            className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-md hover:bg-blue-700 text-sm sm:text-base w-full sm:w-auto"
          >
            Back to Community
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-blue-600 hover:text-blue-700 mb-4 sm:mb-6 p-2 sm:p-0 -ml-2 sm:ml-0"
        >
          <ArrowLeftIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
          <span className="text-sm sm:text-base">Back</span>
        </button>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Images Section */}
          {post.images && post.images.length > 0 && (
            <div className="relative">
              <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                <Image
                  src={post.images[currentImageIndex]}
                  alt={post.title}
                  width={800}
                  height={384}
                  className="w-full h-48 sm:h-64 lg:h-96 object-cover"
                />
              </div>

              {/* Image Navigation */}
              {post.images.length > 1 && (
                <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1 sm:space-x-2">
                  {post.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full touch-target ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Image Counter */}
              {post.images.length > 1 && (
                <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-black/50 text-white px-2 py-1 rounded text-xs sm:text-sm">
                  {currentImageIndex + 1} / {post.images.length}
                </div>
              )}
            </div>
          )}

          {/* Content */}
          <div className="p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 sm:mb-6 space-y-4 sm:space-y-0">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span
                    className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(post.category)}`}
                  >
                    {post.category.replace('_', ' ')}
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 leading-tight">
                  {post.title}
                </h1>
                {post.price && (
                  <div className="text-xl sm:text-2xl font-bold text-green-600 mb-2">
                    ${post.price.toLocaleString()} {post.currency}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2 sm:ml-4">
                <button
                  onClick={handleShare}
                  className="p-2 sm:p-2.5 text-gray-400 hover:text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 touch-target"
                >
                  <ShareIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
                <button
                  onClick={handleLike}
                  disabled={likeLoading}
                  className="flex items-center p-2 sm:p-2.5 text-gray-400 hover:text-red-500 border border-gray-300 rounded-lg hover:bg-gray-50 touch-target disabled:opacity-50"
                >
                  {isLiked ? (
                    <HeartIcon className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                  ) : (
                    <HeartIconOutline className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                  {likeCount > 0 && <span className="ml-1 text-xs">{likeCount}</span>}
                </button>
                {user && user.id !== post.authorId && (
                  <div className="border border-gray-300 rounded-lg hover:bg-gray-50">
                    <ReportButton
                      contentType="post"
                      contentId={post.id}
                      contentAuthorId={post.authorId}
                      size="md"
                      className="p-2 sm:p-2.5"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Author and Date */}
            <div className="flex flex-wrap items-center text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6 gap-3 sm:gap-4">
              <div className="flex items-center">
                <UserIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span>{post.authorName}</span>
              </div>
              <div className="flex items-center">
                <ClockIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span>{formatDate(post.createdAt)}</span>
              </div>
            </div>

            {/* Description */}
            <div className="prose max-w-none mb-6 sm:mb-8">
              <p className="text-gray-700 text-sm sm:text-base lg:text-lg leading-relaxed whitespace-pre-wrap">
                {post.description}
              </p>
            </div>

            {/* Location */}
            {post.location && (
              <div className="mb-6 sm:mb-8">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
                  <MapPinIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Location
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4">{post.location.address}</p>
              </div>
            )}

            {/* Event Details */}
            {post.category === 'events' && (
              <div className="mb-6 sm:mb-8">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
                  <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Event Details
                </h3>
                <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                  {post.eventDate && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-700">Date & Time:</span>
                      <span className="text-sm text-gray-900">{formatDate(post.eventDate)}</span>
                    </div>
                  )}
                  {post.eventEndDate && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-700">End Date:</span>
                      <span className="text-sm text-gray-900">{formatDate(post.eventEndDate)}</span>
                    </div>
                  )}
                  {post.eventType && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-700">Type:</span>
                      <span className="text-sm text-gray-900 capitalize">
                        {post.eventType.replace('_', ' ')}
                      </span>
                    </div>
                  )}
                  {post.capacity && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-700">Capacity:</span>
                      <span className="text-sm text-gray-900">{post.capacity} attendees</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Request Details */}
            {post.category === 'help_requests' && (
              <div className="mb-6 sm:mb-8">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
                  <ExclamationTriangleIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Request Details
                </h3>
                <div className="bg-yellow-50 rounded-lg p-4 space-y-3">
                  {post.urgency && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-700">Urgency:</span>
                      <span
                        className={`text-sm font-medium ${post.urgency === 'high' ? 'text-red-600' : post.urgency === 'medium' ? 'text-yellow-600' : 'text-green-600'}`}
                      >
                        {post.urgency.charAt(0).toUpperCase() + post.urgency.slice(1)}
                      </span>
                    </div>
                  )}
                  {post.helpType && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-700">Help Type:</span>
                      <span className="text-sm text-gray-900 capitalize">
                        {post.helpType.replace('_', ' ')}
                      </span>
                    </div>
                  )}
                  {post.deadline && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-700">Deadline:</span>
                      <span className="text-sm text-gray-900">{formatDate(post.deadline)}</span>
                    </div>
                  )}
                  {post.budget && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-700">Budget:</span>
                      <span className="text-sm text-gray-900">${post.budget.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Item Details */}
            {(post.category === 'marketplace' || post.category === 'free_items') && (
              <div className="mb-6 sm:mb-8">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
                  <ShoppingBagIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Item Details
                </h3>
                <div className="bg-green-50 rounded-lg p-4 space-y-3">
                  {post.condition && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-700">Condition:</span>
                      <span className="text-sm text-gray-900 capitalize">
                        {post.condition.replace('_', ' ')}
                      </span>
                    </div>
                  )}
                  {post.brand && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-700">Brand:</span>
                      <span className="text-sm text-gray-900">{post.brand}</span>
                    </div>
                  )}
                  {(post.deliveryAvailable || post.pickupOnly) && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-700">Pickup/Delivery:</span>
                      <span className="text-sm text-gray-900">
                        {post.pickupOnly
                          ? 'Pickup Only'
                          : post.deliveryAvailable
                            ? 'Delivery Available'
                            : 'Contact for details'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Offer Details */}
            {(post.category === 'deals' || post.category === 'services') && (
              <div className="mb-6 sm:mb-8">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
                  <GiftIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Offer Details
                </h3>
                <div className="bg-purple-50 rounded-lg p-4 space-y-3">
                  {post.duration && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-700">Duration:</span>
                      <span className="text-sm text-gray-900">{post.duration}</span>
                    </div>
                  )}
                  {post.availability && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-700">Availability:</span>
                      <span className="text-sm text-gray-900 capitalize">
                        {post.availability.replace('_', ' ')}
                      </span>
                    </div>
                  )}
                  {post.termsConditions && (
                    <div>
                      <span className="text-sm font-medium text-gray-700 block mb-2">
                        Terms & Conditions:
                      </span>
                      <p className="text-sm text-gray-900 bg-white p-3 rounded border">
                        {post.termsConditions}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Announcement Details */}
            {post.category === 'announcements' && (
              <div className="mb-6 sm:mb-8">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
                  <SpeakerWaveIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Announcement Details
                </h3>
                <div className="bg-red-50 rounded-lg p-4 space-y-3">
                  {post.announcementType && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-700">Type:</span>
                      <span className="text-sm text-gray-900 capitalize">
                        {post.announcementType}
                      </span>
                    </div>
                  )}
                  {post.importance && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-700">Importance:</span>
                      <span
                        className={`text-sm font-medium ${post.importance === 'high' ? 'text-red-600' : post.importance === 'medium' ? 'text-yellow-600' : 'text-green-600'}`}
                      >
                        {post.importance.charAt(0).toUpperCase() + post.importance.slice(1)}
                      </span>
                    </div>
                  )}
                  {post.expiryDate && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-700">Expires:</span>
                      <span className="text-sm text-gray-900">{formatDate(post.expiryDate)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mb-6 sm:mb-8">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
                  <TagIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Section */}
            {(post.category === 'marketplace' || post.category === 'free_items') && (
              <div className="border-t border-gray-200 pt-6 sm:pt-8">
                <div className="bg-blue-50 rounded-lg p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                    Interested in this item?
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-4">
                    Contact {post.authorName} to arrange pickup or ask questions.
                  </p>
                  <button
                    onClick={handleContactSeller}
                    className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-700 font-medium text-sm sm:text-base w-full sm:w-auto"
                  >
                    Contact Seller
                  </button>
                </div>
              </div>
            )}

            {/* Comments Section */}
            <div className="border-t border-gray-200 pt-6 sm:pt-8">
              <CommentsSection postId={post.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
