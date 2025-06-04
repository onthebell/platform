'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/firebase/auth';
import { getBusinesses } from '@/lib/firebase/firestore';
import { Business } from '@/types';
import BusinessCard from '@/components/business/BusinessCard';
import BusinessFilter from '@/components/business/BusinessFilter';
import { PlusIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function BusinessDirectoryPage() {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const loadBusinesses = async () => {
    try {
      setLoading(true);
      const businessList = await getBusinesses({}, 100);
      setBusinesses(businessList);
    } catch (error) {
      console.error('Error loading businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterBusinesses = useCallback(() => {
    let filtered = [...businesses];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        business =>
          business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          business.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          business.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(business => business.category === selectedCategory);
    }

    // Verified filter
    if (verifiedOnly) {
      filtered = filtered.filter(business => business.isVerified);
    }

    setFilteredBusinesses(filtered);
  }, [businesses, searchTerm, selectedCategory, verifiedOnly]);

  useEffect(() => {
    loadBusinesses();
  }, []);

  useEffect(() => {
    filterBusinesses();
  }, [filterBusinesses]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleVerifiedToggle = (verified: boolean) => {
    setVerifiedOnly(verified);
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="animate-pulse">
            <div className="h-6 sm:h-8 bg-gray-200 rounded w-1/2 sm:w-1/4 mb-4 sm:mb-6"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white p-3 sm:p-4 lg:p-6 rounded-lg shadow">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-16 sm:h-20 bg-gray-200 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        {/* Header */}
        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
              <BuildingStorefrontIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mr-2" />
              Business Directory
            </h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600">
              Discover local businesses on the Bellarine Peninsula
            </p>
          </div>

          {user?.isVerified && (
            <Link
              href="/business/add"
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-3 sm:py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 touch-target"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              List Your Business
            </Link>
          )}
        </div>

        {/* Search and Filters */}
        <BusinessFilter
          searchTerm={searchTerm}
          selectedCategory={selectedCategory}
          verifiedOnly={verifiedOnly}
          onSearchChange={handleSearch}
          onCategoryChange={handleCategoryChange}
          onVerifiedToggle={handleVerifiedToggle}
          resultsCount={filteredBusinesses.length}
        />

        {/* Business Grid */}
        {filteredBusinesses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBusinesses.map(business => (
              <BusinessCard key={business.id} business={business} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BuildingStorefrontIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No businesses found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedCategory || verifiedOnly
                ? 'Try adjusting your search criteria.'
                : 'No businesses have been listed yet.'}
            </p>
            {user?.isVerified && (
              <div className="mt-6">
                <Link
                  href="/business/add"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Be the first to list your business
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
