'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getPosts } from '@/lib/firebase/firestore';
import PostsGrid from '@/components/community/PostsGrid';
import { CommunityPost } from '@/types';

export default function DealsPage() {
  const [dealPosts, setDealPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDeals() {
      try {
        setLoading(true);
        setError(null);

        // Fetch deals posts
        const postsData = await getPosts({ category: 'deals' }, 50);
        setDealPosts(postsData);
      } catch (err) {
        console.error('Error loading deals:', err);
        setError('Failed to load deals. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    loadDeals();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Local Deals & Offers</h1>
              <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                Discover exclusive offers and deals from local businesses across the Bellarine
                Peninsula. Support local commerce while saving money on the things you love.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-20 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Local Deals & Offers</h1>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Discover exclusive offers and deals from local businesses across the Bellarine
              Peninsula. Support local commerce while saving money on the things you love.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error ? (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-lg font-medium text-red-800 mb-2">Unable to Load Deals</h3>
              <p className="text-red-600">
                We're having trouble loading the deals right now. Please try again later.
              </p>
            </div>
          </div>
        ) : dealPosts.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 max-w-md mx-auto">
              <h3 className="text-lg font-medium text-gray-800 mb-2">No Deals Available</h3>
              <p className="text-gray-600 mb-4">
                There are currently no deals posted. Check back soon for new offers!
              </p>
              <p className="text-sm text-gray-500">
                Are you a business owner? Share your deals with the community to attract more
                customers.
              </p>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <p className="text-sm text-gray-600">
                Found {dealPosts.length} deal{dealPosts.length !== 1 ? 's' : ''} available
              </p>
            </div>
            <PostsGrid posts={dealPosts} />
          </div>
        )}

        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">
            Want to promote your business?
          </h2>
          <p className="text-blue-700 mb-4">
            Share your deals and special offers with the Bellarine Peninsula community. Verified
            businesses can post deals to attract new customers and build community connections.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/community/create"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Post a Deal
            </Link>
            <Link
              href="/business"
              className="inline-flex items-center justify-center px-4 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 transition-colors"
            >
              Learn About Business Features
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
