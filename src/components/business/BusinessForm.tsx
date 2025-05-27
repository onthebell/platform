'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth';
import { createBusiness } from '@/lib/firebase/firestore';
import { Business } from '@/types';
import { 
  BuildingStorefrontIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  ClockIcon,
  CameraIcon
} from '@heroicons/react/24/outline';

const BUSINESS_CATEGORIES = [
  'restaurant',
  'retail',
  'service',
  'health',
  'automotive',
  'beauty',
  'fitness',
  'education',
  'real-estate',
  'professional',
  'entertainment',
  'other'
];

const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

interface BusinessFormProps {
  business?: Partial<Business>;
  onSubmit?: (business: Business) => void;
  isEditing?: boolean;
}

export default function BusinessForm({ business, onSubmit, isEditing = false }: BusinessFormProps) {
  const { user } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: business?.name || '',
    description: business?.description || '',
    category: business?.category || '',
    address: business?.address || '',
    phone: business?.contact?.phone || '',
    email: business?.contact?.email || '',
    website: business?.contact?.website || '',
    images: business?.images?.join(', ') || '',
    hours: business?.hours || {
      Monday: { open: '09:00', close: '17:00', isClosed: false },
      Tuesday: { open: '09:00', close: '17:00', isClosed: false },
      Wednesday: { open: '09:00', close: '17:00', isClosed: false },
      Thursday: { open: '09:00', close: '17:00', isClosed: false },
      Friday: { open: '09:00', close: '17:00', isClosed: false },
      Saturday: { open: '09:00', close: '17:00', isClosed: false },
      Sunday: { open: '10:00', close: '16:00', isClosed: true }
    },
    coordinates: business?.coordinates || { lat: 0, lng: 0 }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field: string, value: string | number | boolean | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleHoursChange = (day: string, field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      hours: {
        ...prev.hours,
        [day]: {
          ...prev.hours[day],
          [field]: value
        }
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to create a business listing');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const businessData: Omit<Business, 'id' | 'createdAt' | 'updatedAt'> = {
        name: formData.name,
        description: formData.description,
        category: formData.category as Business['category'],
        address: formData.address,
        contact: {
          phone: formData.phone,
          email: formData.email,
          website: formData.website
        },
        images: formData.images.split(',').map((img: string) => img.trim()).filter(Boolean),
        hours: formData.hours,
        coordinates: formData.coordinates,
        ownerId: user.id,
        isVerified: false, // New businesses start unverified
        rating: 0,
        reviewCount: 0
      };

      if (isEditing && onSubmit) {
        onSubmit(businessData as Business);
      } else {
        await createBusiness(businessData);
        router.push('/business?success=created');
      }
    } catch (err) {
      console.error('Error saving business:', err);
      setError('Failed to save business listing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* Basic Information */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
          <BuildingStorefrontIcon className="h-5 w-5 mr-2" />
          Basic Information
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your business name"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe your business, services, and what makes you unique"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              required
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a category</option>
              {BUSINESS_CATEGORIES.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
          <PhoneIcon className="h-5 w-5 mr-2" />
          Contact Information
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPinIcon className="h-4 w-4 inline mr-1" />
              Address *
            </label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your business address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <PhoneIcon className="h-4 w-4 inline mr-1" />
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="(03) 1234 5678"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <EnvelopeIcon className="h-4 w-4 inline mr-1" />
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="contact@yourbusiness.com"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <GlobeAltIcon className="h-4 w-4 inline mr-1" />
              Website
            </label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://www.yourbusiness.com"
            />
          </div>
        </div>
      </div>

      {/* Business Hours */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
          <ClockIcon className="h-5 w-5 mr-2" />
          Business Hours
        </h2>
        
        <div className="space-y-4">
          {DAYS_OF_WEEK.map(day => (
            <div key={day} className="flex items-center space-x-4">
              <div className="w-20 text-sm font-medium text-gray-700">
                {day}
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={!formData.hours[day]?.isClosed}
                  onChange={(e) => handleHoursChange(day, 'isClosed', !e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">Open</span>
              </div>

              {!formData.hours[day]?.isClosed && (
                <>
                  <input
                    type="time"
                    value={formData.hours[day]?.open || '09:00'}
                    onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-500">to</span>
                  <input
                    type="time"
                    value={formData.hours[day]?.close || '17:00'}
                    onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </>
              )}
              
              {formData.hours[day]?.isClosed && (
                <span className="text-sm text-gray-500">Closed</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Images */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
          <CameraIcon className="h-5 w-5 mr-2" />
          Business Images
        </h2>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Image URLs
          </label>
          <input
            type="text"
            value={formData.images}
            onChange={(e) => handleInputChange('images', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
          />
          <p className="text-xs text-gray-500 mt-1">
            Provide URLs to images that represent your business (separate multiple with commas)
          </p>
          
          {formData.images && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
              {formData.images.split(',').map((imgUrl: string, index: number) => {
                const trimmedUrl = imgUrl.trim();
                if (!trimmedUrl) return null;
                return (
                  <Image
                    key={index}
                    src={trimmedUrl}
                    alt={`Business preview ${index + 1}`}
                    width={200}
                    height={128}
                    className="w-full h-32 object-cover rounded-lg border"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : isEditing ? 'Update Business' : 'Create Business'}
        </button>
      </div>
    </form>
  );
}
