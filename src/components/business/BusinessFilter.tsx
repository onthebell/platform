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
    <div className="bg-white p-6 rounded-lg shadow mb-8">
      <div className="flex items-center mb-4">
        <FunnelIcon className="h-5 w-5 text-gray-400 mr-2" />
        <h3 className="text-lg font-medium text-gray-900">Filter Businesses</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        {/* Search */}
        <div className="md:col-span-2">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search businesses..."
              value={searchTerm}
              onChange={e => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={selectedCategory}
            onChange={e => onCategoryChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
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
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={e => onVerifiedToggle(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Verified only</span>
          </label>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        {resultsCount} business{resultsCount !== 1 ? 'es' : ''} found
        {(searchTerm || selectedCategory || verifiedOnly) && (
          <button
            onClick={() => {
              onSearchChange('');
              onCategoryChange('');
              onVerifiedToggle(false);
            }}
            className="ml-4 text-blue-600 hover:text-blue-800 underline"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
