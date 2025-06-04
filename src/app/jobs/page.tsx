'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth';
import { getPosts } from '@/lib/firebase/firestore';
import { CommunityPost, JobType } from '@/types';
import PostsGrid from '@/components/community/PostsGrid';
import Link from 'next/link';
import { PlusIcon, BriefcaseIcon } from '@heroicons/react/24/outline';

function JobsPageContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const selectedType = searchParams.get('type') as JobType | null;

  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter posts based on selected job type
  const filteredPosts = selectedType ? posts.filter(post => post.jobType === selectedType) : posts;

  useEffect(() => {
    const fetchJobPosts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch only job posts
        const jobPosts = await getPosts({ category: 'jobs', status: 'active' }, 50);

        // Filter posts based on user verification status
        const filteredJobPosts = jobPosts.filter(post => {
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

        setPosts(filteredJobPosts);
      } catch (err) {
        console.error('Error fetching job posts:', err);
        setError('Failed to load job posts');
      } finally {
        setLoading(false);
      }
    };

    fetchJobPosts();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading jobs...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center">
              <BriefcaseIcon className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Jobs on the Bell</h1>
                <p className="mt-1 text-sm sm:text-base text-gray-600">
                  Find local employment opportunities in the Bellarine Peninsula
                </p>
              </div>
            </div>

            {user && (
              <Link
                href="/community/create?category=jobs"
                className="mt-4 sm:mt-0 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Post a Job
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Job Categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Current Filter Display */}
        {selectedType && (
          <div className="mb-6 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <span className="text-sm text-blue-800">
                Showing{' '}
                <strong>
                  {selectedType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </strong>{' '}
                jobs ({filteredPosts.length} found)
              </span>
            </div>
            <Link href="/jobs" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              Clear filter
            </Link>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-8">
          <Link
            href="/jobs?type=full_time"
            className={`bg-white p-4 rounded-lg border hover:shadow-md transition-all text-center ${
              selectedType === 'full_time'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className="text-sm font-medium text-gray-900">Full Time</div>
            <div className="text-xs text-gray-500 mt-1">
              {posts.filter(p => p.jobType === 'full_time').length} jobs
            </div>
          </Link>

          <Link
            href="/jobs?type=part_time"
            className={`bg-white p-4 rounded-lg border hover:shadow-md transition-all text-center ${
              selectedType === 'part_time'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className="text-sm font-medium text-gray-900">Part Time</div>
            <div className="text-xs text-gray-500 mt-1">
              {posts.filter(p => p.jobType === 'part_time').length} jobs
            </div>
          </Link>

          <Link
            href="/jobs?type=one_off"
            className={`bg-white p-4 rounded-lg border hover:shadow-md transition-all text-center ${
              selectedType === 'one_off'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className="text-sm font-medium text-gray-900">One-off</div>
            <div className="text-xs text-gray-500 mt-1">
              {posts.filter(p => p.jobType === 'one_off').length} jobs
            </div>
          </Link>

          <Link
            href="/jobs?type=contract"
            className={`bg-white p-4 rounded-lg border hover:shadow-md transition-all text-center ${
              selectedType === 'contract'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className="text-sm font-medium text-gray-900">Contract</div>
            <div className="text-xs text-gray-500 mt-1">
              {posts.filter(p => p.jobType === 'contract').length} jobs
            </div>
          </Link>

          <Link
            href="/jobs?type=volunteer"
            className={`bg-white p-4 rounded-lg border hover:shadow-md transition-all text-center ${
              selectedType === 'volunteer'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className="text-sm font-medium text-gray-900">Volunteer</div>
            <div className="text-xs text-gray-500 mt-1">
              {posts.filter(p => p.jobType === 'volunteer').length} jobs
            </div>
          </Link>
        </div>

        {/* Job Listings */}
        <PostsGrid
          posts={filteredPosts}
          title={`${filteredPosts.length} Job${filteredPosts.length !== 1 ? 's' : ''} Available${selectedType ? ` - ${selectedType.replace('_', ' ')}` : ''}`}
          showFilters={true}
          showCreateButton={false}
          emptyMessage="No job posts found. Be the first to post a job opportunity!"
          layout="grid"
        />
      </div>
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <span className="text-gray-500">Loading jobs...</span>
        </div>
      }
    >
      <JobsPageContent />
    </Suspense>
  );
}
