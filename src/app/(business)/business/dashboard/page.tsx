'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/lib/firebase/auth';
import { getBusinesses } from '@/lib/firebase/firestore';
import { Business } from '@/types';
import Link from 'next/link';
import {
  BuildingStorefrontIcon,
  PencilIcon,
  EyeIcon,
  ChartBarIcon,
  CheckBadgeIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

export default function BusinessDashboard() {
  const { user, loading } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserBusinesses = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        // Get all businesses for the current user
        const allBusinesses = await getBusinesses();
        const userBusinesses = allBusinesses.filter(business => business.ownerId === user.id);
        setBusinesses(userBusinesses);
      } catch (err) {
        console.error('Error fetching businesses:', err);
        setError('Failed to load your businesses');
      } finally {
        setIsLoading(false);
      }
    };

    if (!loading) {
      fetchUserBusinesses();
    }
  }, [user, loading]);

  const getStatusBadge = (isVerified: boolean) => {
    if (isVerified) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckBadgeIcon className="w-3 h-3 mr-1" />
          Verified
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        Active
      </span>
    );
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your businesses...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BuildingStorefrontIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Please log in</h3>
          <p className="mt-1 text-sm text-gray-500">
            You need to be logged in to manage your business listings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Business Dashboard</h1>
              <p className="mt-2 text-gray-600">
                Manage your business listings and track their performance.
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Link
                href="/business/add"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Business
              </Link>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {/* Business Cards */}
        {businesses.length === 0 ? (
          <div className="text-center py-12">
            <BuildingStorefrontIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No businesses yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding your first business to the directory.
            </p>
            <div className="mt-6">
              <Link
                href="/business/add"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Your First Business
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {businesses.map(business => (
              <div key={business.id} className="bg-white overflow-hidden shadow rounded-lg">
                {business.images && business.images.length > 0 && (
                  <div className="h-48 bg-gray-200">
                    <Image
                      src={business.images[0]}
                      alt={business.name}
                      width={400}
                      height={192}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium text-gray-900 truncate">{business.name}</h3>
                    {getStatusBadge(business.isVerified)}
                  </div>

                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{business.description}</p>

                  <div className="text-sm text-gray-500 mb-4">
                    <p className="capitalize">{business.category.replace('-', ' ')}</p>
                    <p>{business.address}</p>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <ChartBarIcon className="h-4 w-4 mr-1" />
                      <span>
                        {business.rating.toFixed(1)} ({business.reviewCount} reviews)
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3">
                    <Link
                      href={`/business/${business.id}`}
                      className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors text-center"
                    >
                      <EyeIcon className="h-4 w-4 inline mr-1" />
                      View
                    </Link>
                    <Link
                      href={`/business/manage/${business.id}`}
                      className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors text-center"
                    >
                      <PencilIcon className="h-4 w-4 inline mr-1" />
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
