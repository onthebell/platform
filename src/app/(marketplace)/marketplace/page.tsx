'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PostsGrid from '@/components/community/PostsGrid';
import { getPosts } from '@/lib/firebase/firestore';
import { CommunityPost } from '@/types';

export default function MarketplacePage() {
  const [activeTab, setActiveTab] = useState<'for-sale' | 'free'>('for-sale');
  const [marketplacePosts, setMarketplacePosts] = useState<CommunityPost[]>([]);
  const [freePosts, setFreePosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMarketplaceData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch marketplace posts (for sale items)
        const marketplaceData = await getPosts({ category: 'marketplace' }, 50);
        setMarketplacePosts(marketplaceData);

        // Fetch free items
        const freeData = await getPosts({ category: 'free_items' }, 50);
        setFreePosts(freeData);

      } catch (err) {
        console.error('Error loading marketplace data:', err);
        setError('Failed to load marketplace data. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    loadMarketplaceData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Marketplace</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Buy, sell, and trade with your Bellarine Peninsula neighbors
            </p>
          </div>
          
          <div className="animate-pulse space-y-6">
            <div className="flex justify-center mb-8">
              <div className="bg-gray-200 rounded-lg h-12 w-64"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Marketplace</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Buy, sell, and trade with your Bellarine Peninsula neighbors. From furniture to 
            electronics, find great deals or list your own items.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1 flex">
            <button
              onClick={() => setActiveTab('for-sale')}
              className={`px-6 py-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'for-sale'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              For Sale ({marketplacePosts.length})
            </button>
            <button
              onClick={() => setActiveTab('free')}
              className={`px-6 py-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'free'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Free Items ({freePosts.length})
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'for-sale' && (
          <PostsGrid 
            posts={marketplacePosts}
            title="Items for Sale"
            showFilters={false}
            showCreateButton={true}
            emptyMessage="No items for sale at the moment. Check back later or list something yourself!"
          />
        )}

        {activeTab === 'free' && (
          <PostsGrid 
            posts={freePosts}
            title="Free Items"
            showFilters={false}
            showCreateButton={true}
            emptyMessage="No free items available right now. Check back later or offer something yourself!"
          />
        )}

        {/* Call to Action */}
        <div className="mt-16 text-center bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Got something to sell or give away?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Join the Bellarine community marketplace. List your items for sale or offer them for free 
            to help reduce waste and build community connections.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/community/create?category=marketplace&type=sale"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              List an Item for Sale
            </Link>
            <Link 
              href="/community/create?category=free_items&type=free"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Offer Something Free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
