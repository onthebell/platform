'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  MapPinIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  GlobeAltIcon,
  StarIcon,
  ClockIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { Business } from '@/types';

interface BusinessCardProps {
  business: Business;
}

export default function BusinessCard({ business }: BusinessCardProps) {
  const [imageError, setImageError] = useState(false);

  const formatHours = (hours: Business['hours']) => {
    const today = new Intl.DateTimeFormat('en-AU', { weekday: 'long' }).format(new Date());
    const todayHours = hours[today];
    
    if (!todayHours) return 'Hours not available';
    if (todayHours.isClosed) return 'Closed today';
    
    return `${todayHours.open} - ${todayHours.close}`;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="relative">
        {i < Math.floor(rating) ? (
          <StarIconSolid className="h-4 w-4 text-yellow-400" />
        ) : i < rating ? (
          <>
            <StarIcon className="h-4 w-4 text-gray-300" />
            <StarIconSolid 
              className="absolute top-0 left-0 h-4 w-4 text-yellow-400" 
              style={{ clipPath: `inset(0 ${100 - (rating % 1) * 100}% 0 0)` }}
            />
          </>
        ) : (
          <StarIcon className="h-4 w-4 text-gray-300" />
        )}
      </div>
    ));
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden border border-gray-200">
      {/* Business Image */}
      <div className="relative h-48 bg-gray-200">
        {business.images.length > 0 && !imageError ? (
          <Image
            src={business.images[0]}
            alt={business.name}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <svg fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1zM10 6a2 2 0 0 1 4 0v1h-4V6zm8 13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V9h2v1a1 1 0 0 0 2 0V9h4v1a1 1 0 0 0 2 0V9h2v10z"/>
                </svg>
              </div>
              <p className="mt-2 text-sm text-gray-500">No image</p>
            </div>
          </div>
        )}
        
        {/* Verified Badge */}
        {business.isVerified && (
          <div className="absolute top-2 right-2">
            <CheckBadgeIcon className="h-6 w-6 text-blue-600 bg-white rounded-full p-1" />
          </div>
        )}
      </div>

      {/* Business Info */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
            {business.name}
          </h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {business.category}
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {business.description}
        </p>

        {/* Rating */}
        {business.reviewCount > 0 && (
          <div className="flex items-center mb-3">
            <div className="flex space-x-1">
              {renderStars(business.rating)}
            </div>
            <span className="ml-2 text-sm text-gray-600">
              {business.rating.toFixed(1)} ({business.reviewCount} review{business.reviewCount !== 1 ? 's' : ''})
            </span>
          </div>
        )}

        {/* Address */}
        <div className="flex items-start mb-2">
          <MapPinIcon className="h-4 w-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
          <span className="text-sm text-gray-600 line-clamp-2">{business.address}</span>
        </div>

        {/* Hours */}
        <div className="flex items-center mb-4">
          <ClockIcon className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-sm text-gray-600">{formatHours(business.hours)}</span>
        </div>

        {/* Contact Info */}
        <div className="space-y-2 mb-4">
          {business.contact.phone && (
            <div className="flex items-center">
              <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
              <a 
                href={`tel:${business.contact.phone}`}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {business.contact.phone}
              </a>
            </div>
          )}
          
          {business.contact.email && (
            <div className="flex items-center">
              <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-2" />
              <a 
                href={`mailto:${business.contact.email}`}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {business.contact.email}
              </a>
            </div>
          )}
          
          {business.contact.website && (
            <div className="flex items-center">
              <GlobeAltIcon className="h-4 w-4 text-gray-400 mr-2" />
              <a 
                href={business.contact.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Visit Website
              </a>
            </div>
          )}
        </div>

        {/* View Details Button */}
        <Link
          href={`/business/${business.id}`}
          className="block w-full text-center px-4 py-2 border border-blue-600 text-blue-600 rounded-md text-sm font-medium hover:bg-blue-50 transition-colors"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
