'use client';

import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';

const BUSINESS_CATEGORIES = [
  'Restaurant',
  'Retail',
  'Health & Wellness',
  'Professional Services',
  'Home & Garden',
  'Auto & Transport',
  'Entertainment',
  'Education',
  'Beauty & Personal Care',
  'Other',
];

interface BusinessFilterProps {
  searchTerm: string;
  selectedCategory: string;
  verifiedOnly: boolean;
  onSearchChange: (term: string) => void;
  onCategoryChange: (category: string) => void;
  onVerifiedToggle: (verified: boolean) => void;
  resultsCount: number;
}

export default function BusinessFilter({
  searchTerm,
  selectedCategory,
  verifiedOnly,
  onSearchChange,
  onCategoryChange,
  onVerifiedToggle,
  resultsCount,
}: BusinessFilterProps) {
  return (
    <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-lg shadow mb-6 sm:mb-8">
      <div className="flex items-center mb-3 sm:mb-4">
        <FunnelIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mr-2" />
        <h3 className="text-base sm:text-lg font-medium text-gray-900">Filter Businesses</h3>
      </div>

      <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-1 lg:grid-cols-4 sm:gap-4 mb-4">
        {/* Search */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1 sm:hidden">Search</label>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search businesses..."
              value={searchTerm}
              onChange={e => onSearchChange(e.target.value)}
              className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-3 sm:py-2 text-base sm:text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 touch-target"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 sm:hidden">Category</label>
          <select
            value={selectedCategory}
            onChange={e => onCategoryChange(e.target.value)}
            className="w-full px-3 py-3 sm:py-2 text-base sm:text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 touch-target"
          >
            <option value="">All Categories</option>
            {BUSINESS_CATEGORIES.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Verified Filter */}
        <div className="flex items-center">
          <label className="flex items-center touch-target">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={e => onVerifiedToggle(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm sm:text-sm text-gray-700">Verified only</span>
          </label>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600 space-y-2 sm:space-y-0">
        <span>
          {resultsCount} business{resultsCount !== 1 ? 'es' : ''} found
        </span>
        {(searchTerm || selectedCategory || verifiedOnly) && (
          <button
            onClick={() => {
              onSearchChange('');
              onCategoryChange('');
              onVerifiedToggle(false);
            }}
            className="text-blue-600 hover:text-blue-800 underline touch-target w-fit"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
