'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/firebase/auth';
import { useSavedJobs } from '@/hooks/useSavedJobs';
import { getPostById } from '@/lib/firebase/firestore';
import { CommunityPost } from '@/types';
import PostCard from '@/components/community/PostCard';
import { BookmarkIcon, ArrowLeftIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function SavedJobsPage() {
  const { user } = useAuth();
  const { savedJobs, isLoading, error } = useSavedJobs();
  const [jobPosts, setJobPosts] = useState<CommunityPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  // Load the actual job posts from saved job IDs
  useEffect(() => {
    if (savedJobs.length === 0) {
      setJobPosts([]);
      return;
    }

    const loadJobPosts = async () => {
      setLoadingPosts(true);
      try {
        const posts = await Promise.all(
          savedJobs.map(async savedJob => {
            try {
              const post = await getPostById(savedJob.postId);
              return post;
            } catch (err) {
              console.error(`Error loading post ${savedJob.postId}:`, err);
              return null;
            }
          })
        );

        // Filter out null posts (posts that couldn't be loaded or were deleted)
        const validPosts = posts.filter((post): post is CommunityPost => post !== null);
        setJobPosts(validPosts);
      } catch (err) {
        console.error('Error loading job posts:', err);
      } finally {
        setLoadingPosts(false);
      }
    };

    loadJobPosts();
  }, [savedJobs]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookmarkIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="mt-2 text-lg font-medium text-gray-900">Sign In Required</h2>
          <p className="mt-1 text-sm text-gray-500">
            You need to be signed in to view your saved jobs.
          </p>
          <div className="mt-6">
            <Link
              href="/auth/signin"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link
              href="/jobs"
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Back to Jobs
            </Link>
          </div>

          <div className="flex items-center space-x-3">
            <BookmarkIcon className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Saved Jobs</h1>
              <p className="text-gray-600">
                {savedJobs.length === 0
                  ? 'No saved jobs yet'
                  : `${savedJobs.length} saved job${savedJobs.length !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {(isLoading || loadingPosts) && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading saved jobs...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !loadingPosts && savedJobs.length === 0 && (
          <div className="text-center py-12">
            <BookmarkIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No saved jobs</h3>
            <p className="mt-1 text-sm text-gray-500">
              Start browsing jobs and save the ones you're interested in.
            </p>
            <div className="mt-6">
              <Link
                href="/jobs"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Browse Jobs
              </Link>
            </div>
          </div>
        )}

        {/* Jobs Grid */}
        {!isLoading && !loadingPosts && jobPosts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobPosts.map(job => (
              <PostCard key={job.id} post={job} isCompact={false} showAsJobCard={true} />
            ))}
          </div>
        )}

        {/* Show message if some saved jobs couldn't be loaded */}
        {!isLoading && !loadingPosts && savedJobs.length > jobPosts.length && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-2" />
              <p className="text-sm text-yellow-800">
                Some saved jobs may have been removed or are no longer available.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
