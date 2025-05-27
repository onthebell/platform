'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth';
import { getPostById } from '@/lib/firebase/firestore';
import { CommunityPost } from '@/types';
import { MapPinIcon, ClockIcon, TagIcon, UserIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { HeartIcon, ShareIcon } from '@heroicons/react/24/solid';
import dynamic from 'next/dynamic';

// Dynamically import the map to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [post, setPost] = useState<CommunityPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading post...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The post you\'re looking for doesn\'t exist.'}</p>
          <button
            onClick={() => router.push('/community')}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Back to Community
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back
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
                  className="w-full h-96 object-cover"
                />
              </div>
              
              {/* Image Navigation */}
              {post.images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {post.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-3 h-3 rounded-full ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Image Counter */}
              {post.images.length > 1 && (
                <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
                  {currentImageIndex + 1} / {post.images.length}
                </div>
              )}
            </div>
          )}

          {/* Content */}
          <div className="p-8">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(post.category)}`}>
                    {post.category.replace('_', ' ')}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {post.type}
                  </span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{post.title}</h1>
                {post.price && (
                  <div className="text-2xl font-bold text-green-600 mb-2">
                    ${post.price.toLocaleString()} {post.currency}
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={handleShare}
                  className="p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <ShareIcon className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-red-500 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <HeartIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Author and Date */}
            <div className="flex items-center text-sm text-gray-500 mb-6">
              <UserIcon className="h-4 w-4 mr-1" />
              <span className="mr-4">{post.authorName}</span>
              <ClockIcon className="h-4 w-4 mr-1" />
              <span>{formatDate(post.createdAt)}</span>
            </div>

            {/* Description */}
            <div className="prose max-w-none mb-8">
              <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
                {post.description}
              </p>
            </div>

            {/* Location */}
            {post.location && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPinIcon className="h-5 w-5 mr-2" />
                  Location
                </h3>
                <p className="text-gray-600 mb-4">{post.location.address}</p>
                
                {/* Map */}
                <div className="h-64 rounded-lg overflow-hidden border border-gray-200">
                  <MapContainer
                    center={[post.location.lat, post.location.lng]}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <Marker position={[post.location.lat, post.location.lng]}>
                      <Popup>{post.location.address}</Popup>
                    </Marker>
                  </MapContainer>
                </div>
              </div>
            )}

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <TagIcon className="h-5 w-5 mr-2" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Section */}
            {(post.category === 'marketplace' || post.category === 'free_items') && (
              <div className="border-t border-gray-200 pt-8">
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Interested in this item?
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Contact {post.authorName} to arrange pickup or ask questions.
                  </p>
                  <button
                    onClick={handleContactSeller}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Contact Seller
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
