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
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Events</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover what's happening on the Bellarine Peninsula
            </p>
          </div>

          <div className="animate-pulse space-y-6">
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Events</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
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
        <div className="mt-16 text-center bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Organizing an event?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Share your event with the Bellarine community. Whether it's a market, workshop, or
            community gathering, let everyone know what's happening.
          </p>
          <Link
            href="/community/create?category=events&type=event"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Create an Event
          </Link>
        </div>
      </div>
    </div>
  );
}
