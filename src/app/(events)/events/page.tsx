'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PostsGrid from '@/components/community/PostsGrid';
import { getPosts } from '@/lib/firebase/firestore';
import { CommunityPost } from '@/types';

export default function EventsPage() {
  const [eventPosts, setEventPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadEvents() {
      try {
        setLoading(true);
        setError(null);

        // Fetch events posts
        const eventsData = await getPosts({ category: 'events' }, 50);
        setEventPosts(eventsData);
      } catch (err) {
        console.error('Error loading events:', err);
        setError('Failed to load events. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 xl:px-8 py-6 sm:py-8">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Events
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-2 sm:px-0">
              Discover what's happening on the Bellarine Peninsula
            </p>
          </div>

          <div className="animate-pulse space-y-4 sm:space-y-6">
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
            Events
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-2 sm:px-0">
            Discover what's happening on the Bellarine Peninsula. From markets to festivals, find
            local events and activities for the whole community.
          </p>
        </div>

        <PostsGrid
          posts={eventPosts}
          title="Upcoming Events"
          showFilters={false}
          showCreateButton={true}
          emptyMessage="No events scheduled at the moment. Check back later or create your own event!"
        />

        {/* Call to Action */}
        <div className="mt-12 sm:mt-16 text-center bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
            Organizing an event?
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 max-w-2xl mx-auto px-2 sm:px-0">
            Share your event with the Bellarine community. Whether it's a market, workshop, or
            community gathering, let everyone know what's happening.
          </p>
          <Link
            href="/community/create?category=events&type=event"
            className="inline-flex items-center justify-center w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Create an Event
          </Link>
        </div>
      </div>
    </div>
  );
}
