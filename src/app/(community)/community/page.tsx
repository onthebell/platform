'use client';

import { useState, useEffect } from 'react';
import PostsGrid from '@/components/community/PostsGrid';
import { getPosts } from '@/lib/firebase/firestore';
import { useAuth } from '@/lib/firebase/auth';
import { CommunityPost } from '@/types';

export default function CommunityPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPosts() {
      try {
        setLoading(true);
        setError(null);

        // Fetch all community posts
        const postsData = await getPosts({}, 50); // Get up to 50 active posts

        // Filter posts based on user verification status
        const filteredPosts = postsData.filter(post => {
          // Always show public posts
          if (post.visibility === 'public') {
            return true;
          }

          // Only show verified_only posts to verified users
          if (post.visibility === 'verified_only') {
            return user && user.isVerified;
          }

          return false;
        });

        setPosts(filteredPosts);
      } catch (err) {
        console.error('Error loading community posts:', err);
        setError('Failed to load community posts. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    loadPosts();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 xl:px-8 py-6 sm:py-8">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Community
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-2 sm:px-0">
              Connect with your Bellarine Peninsula community. Browse local events, marketplace
              items, and connect with your neighbors.
            </p>
          </div>

          <div className="animate-pulse space-y-4 sm:space-y-6">
            <div className="h-6 sm:h-8 bg-gray-200 rounded w-1/2 sm:w-1/4 mb-3 sm:mb-4"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6"
                >
                  <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-2.5 sm:h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-2.5 sm:h-3 bg-gray-200 rounded w-2/3"></div>
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
        <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 xl:px-8 py-6 sm:py-8">
          <div className="text-center py-8 sm:py-12">
            <p className="text-sm sm:text-base text-gray-600 mb-4 px-2 sm:px-0">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm sm:text-base"
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
      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 xl:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Community
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-2 sm:px-0">
            Connect with your Bellarine Peninsula community. Browse local events, marketplace items,
            and connect with your neighbors.
          </p>
        </div>

        <PostsGrid
          posts={posts}
          title="Community Posts"
          showFilters={true}
          showCreateButton={true}
        />
      </div>
    </div>
  );
}
