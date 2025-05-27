'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth';
import { getBusiness } from '@/lib/firebase/firestore';
import { Business } from '@/types';
import { 
  StarIcon, 
  MapPinIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  GlobeAltIcon,
  ClockIcon,
  ShieldCheckIcon,
  ArrowLeftIcon,
  ShareIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid, HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import Link from 'next/link';
import Image from 'next/image';

const DAYS_OF_WEEK = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
];

const DAY_NAMES = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

export default function BusinessDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadBusiness(params.id as string);
    }
  }, [params.id]);

  const loadBusiness = async (businessId: string) => {
    try {
      setLoading(true);
      const businessData = await getBusiness(businessId);
      setBusiness(businessData);
    } catch (error) {
      console.error('Error loading business:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <StarIconSolid key={i} className="h-5 w-5 text-yellow-400" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <StarIcon className="h-5 w-5 text-gray-300" />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <StarIconSolid className="h-5 w-5 text-yellow-400" />
            </div>
          </div>
        );
      } else {
        stars.push(
          <StarIcon key={i} className="h-5 w-5 text-gray-300" />
        );
      }
    }
    return stars;
  };

  const getCurrentDayHours = () => {
    if (!business?.hours) return null;
    
    const today = new Date().getDay();
    const dayIndex = today === 0 ? 6 : today - 1; // Convert Sunday (0) to index 6
    const dayName = DAYS_OF_WEEK[dayIndex];
    
    return business.hours[dayName];
  };

  const handleShare = async () => {
    if (navigator.share && business) {
      try {
        await navigator.share({
          title: business.name,
          text: business.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else if (business) {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href);
      // Could add a toast notification here
    }
  };

  const toggleFavorite = () => {
    setIsFavorited(!isFavorited);
    // TODO: Implement actual favorite functionality with backend
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-300 rounded mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              <div className="h-4 bg-gray-300 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Business not found</h1>
            <Link 
              href="/business" 
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Back to Business Directory
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back
        </button>

        {/* Business Header */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          {/* Business Image */}
          {business.images && business.images.length > 0 && (
            <div className="relative h-64 w-full">
              <Image
                src={business.images[0]}
                alt={business.name}
                fill
                className="object-cover"
              />
            </div>
          )}

          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <h1 className="text-3xl font-bold text-gray-900 mr-3">
                    {business.name}
                  </h1>
                  {business.isVerified && (
                    <ShieldCheckIcon className="h-6 w-6 text-blue-600" title="Verified Business" />
                  )}
                </div>

                <div className="flex items-center mb-4">
                  <div className="flex items-center mr-4">
                    {renderStars(business.rating || 0)}
                    <span className="ml-2 text-sm text-gray-600">
                      {business.rating ? `${business.rating} (${business.reviewCount || 0} reviews)` : 'No reviews yet'}
                    </span>
                  </div>
                  
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {business.category}
                  </span>
                </div>

                <p className="text-gray-600 mb-4">{business.description}</p>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {business.address && (
                    <div className="flex items-center text-gray-600">
                      <MapPinIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                      <span>{business.address}</span>
                    </div>
                  )}
                  
                  {business.contact?.phone && (
                    <div className="flex items-center text-gray-600">
                      <PhoneIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                      <a href={`tel:${business.contact.phone}`} className="hover:text-blue-600">
                        {business.contact.phone}
                      </a>
                    </div>
                  )}
                  
                  {business.contact?.email && (
                    <div className="flex items-center text-gray-600">
                      <EnvelopeIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                      <a href={`mailto:${business.contact.email}`} className="hover:text-blue-600">
                        {business.contact.email}
                      </a>
                    </div>
                  )}
                  
                  {business.contact?.website && (
                    <div className="flex items-center text-gray-600">
                      <GlobeAltIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                      <a 
                        href={business.contact.website.startsWith('http') ? business.contact.website : `https://${business.contact.website}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:text-blue-600"
                      >
                        {business.contact.website}
                      </a>
                    </div>
                  )}
                </div>

                {/* Business Hours */}
                {business.hours && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <ClockIcon className="h-5 w-5 mr-2" />
                      Business Hours
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                      {DAY_NAMES.map((day, index) => {
                        const hours = business.hours?.[day];
                        const isToday = new Date().getDay() === (index === 6 ? 0 : index + 1);
                        console.log(`Checking hours for ${day}:`, business.hours);
                        return (
                          <div key={day} className={`flex justify-between py-1 ${isToday ? 'font-semibold text-blue-600' : 'text-gray-600'}`}>
                            <span>{day}:</span>
                            <span>{!hours?.isClosed ? `${hours?.open} - ${hours?.close}` : 'Closed'}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex flex-col space-y-2 ml-6">
                <button
                  onClick={handleShare}
                  className="p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded-md"
                  title="Share"
                >
                  <ShareIcon className="h-5 w-5" />
                </button>
                
                {user && (
                  <button
                    onClick={toggleFavorite}
                    className="p-2 text-gray-400 hover:text-red-600 border border-gray-300 rounded-md"
                    title={isFavorited ? "Remove from favorites" : "Add to favorites"}
                  >
                    {isFavorited ? (
                      <HeartIconSolid className="h-5 w-5 text-red-600" />
                    ) : (
                      <HeartIcon className="h-5 w-5" />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
              <p className="text-gray-600 whitespace-pre-wrap">
                {business.description}
              </p>
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Reviews</h2>
              <div className="text-center py-8 text-gray-500">
                <p>Reviews feature coming soon</p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {business.contact?.phone && (
                  <a
                    href={`tel:${business.contact.phone}`}
                    className="w-full flex items-center justify-center px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50"
                  >
                    <PhoneIcon className="h-4 w-4 mr-2" />
                    Call Now
                  </a>
                )}
                
                {business.contact?.email && (
                  <a
                    href={`mailto:${business.contact.email}`}
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    <EnvelopeIcon className="h-4 w-4 mr-2" />
                    Send Email
                  </a>
                )}
                
                {business.contact?.website && (
                  <a
                    href={business.contact.website.startsWith('http') ? business.contact.website : `https://${business.contact.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    <GlobeAltIcon className="h-4 w-4 mr-2" />
                    Visit Website
                  </a>
                )}
              </div>
            </div>

            {/* Current Hours */}
            {getCurrentDayHours() && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Today&apos;s Hours</h3>
                <div className="text-gray-600">
                  {!getCurrentDayHours()?.isClosed ? (
                    <span className="text-green-600">
                      Open: {getCurrentDayHours()?.open} - {getCurrentDayHours()?.close}
                    </span>
                  ) : (                        <span className="text-red-600">Closed Today</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
