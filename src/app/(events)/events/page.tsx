'use client';

import { useState } from 'react';
import Link from 'next/link';
import PostsGrid from '@/components/community/PostsGrid';
import { CommunityPost } from '@/types';

// Sample events data
const eventPosts: CommunityPost[] = [
  {
    id: 'event1',
    title: 'Bellarine Farmers Market',
    description: 'Weekly farmers market featuring fresh local produce, artisan goods, and community stalls. Every Saturday from 8am-2pm at the Drysdale Town Square.',
    category: 'events',
    type: 'event',
    authorId: 'market-organizer',
    authorName: 'Bellarine Markets',
    location: {
      lat: -38.1684,
      lng: 144.5663,
      address: 'Drysdale Town Square, Drysdale VIC',
    },
    images: ['/images/farmers-market.jpg'],
    status: 'active',
    visibility: 'public',
    createdAt: new Date('2025-05-25'),
    updatedAt: new Date('2025-05-25'),
    tags: ['market', 'farmers', 'local', 'produce', 'weekly'],
  },
  {
    id: 'event2',
    title: 'Community Movie Night',
    description: 'Join us for a family-friendly outdoor movie screening at the Portarlington Foreshore. BYO chairs and blankets. Popcorn and drinks available for purchase.',
    category: 'events',
    type: 'event',
    authorId: 'community-events',
    authorName: 'Portarlington Community Centre',
    location: {
      lat: -38.1789,
      lng: 144.6417,
      address: 'Portarlington Foreshore, Portarlington VIC',
    },
    images: ['/images/movie-night.jpg'],
    status: 'active',
    visibility: 'public',
    createdAt: new Date('2025-05-24'),
    updatedAt: new Date('2025-05-24'),
    tags: ['movie', 'family', 'outdoor', 'community', 'foreshore'],
  },
  {
    id: 'event3',
    title: 'Yoga by the Bay',
    description: 'Start your morning with peaceful yoga sessions overlooking Corio Bay. All levels welcome. Classes run every Tuesday and Thursday at 7am.',
    category: 'events',
    type: 'event',
    authorId: 'yoga-instructor',
    authorName: 'Sarah Chen - Bellarine Yoga',
    location: {
      lat: -38.1499,
      lng: 144.3617,
      address: 'Eastern Beach, Geelong VIC',
    },
    images: ['/images/yoga-bay.jpg'],
    status: 'active',
    visibility: 'public',
    createdAt: new Date('2025-05-23'),
    updatedAt: new Date('2025-05-23'),
    tags: ['yoga', 'fitness', 'wellness', 'beach', 'morning'],
  },
  {
    id: 'event4',
    title: 'Queenscliff Music Festival',
    description: 'Annual music festival featuring local and touring artists across multiple venues in historic Queenscliff. Weekend passes now available.',
    category: 'events',
    type: 'event',
    authorId: 'festival-org',
    authorName: 'Queenscliff Music Festival',
    price: 85,
    currency: 'AUD',
    location: {
      lat: -38.2654,
      lng: 144.6631,
      address: 'Multiple venues, Queenscliff VIC',
    },
    images: ['/images/music-festival.jpg'],
    status: 'active',
    visibility: 'public',
    createdAt: new Date('2025-05-22'),
    updatedAt: new Date('2025-05-22'),
    tags: ['music', 'festival', 'entertainment', 'weekend', 'live'],
  },
  {
    id: 'event5',
    title: 'Barwon Heads Market',
    description: 'Monthly market featuring handmade crafts, vintage finds, and local food vendors. First Sunday of every month at the Barwon Heads Community Centre.',
    category: 'events',
    type: 'event',
    authorId: 'market-coordinator',
    authorName: 'Barwon Heads Markets',
    location: {
      lat: -38.2450,
      lng: 144.5989,
      address: 'Barwon Heads Community Centre, Barwon Heads VIC',
    },
    images: ['/images/craft-market.jpg'],
    status: 'active',
    visibility: 'public',
    createdAt: new Date('2025-05-21'),
    updatedAt: new Date('2025-05-21'),
    tags: ['market', 'crafts', 'vintage', 'monthly', 'community'],
  },
  {
    id: 'event6',
    title: 'Ocean Grove Surf Competition',
    description: 'Annual surf competition for all skill levels. Spectators welcome! Registration includes lunch and prizes for winners in each category.',
    category: 'events',
    type: 'event',
    authorId: 'surf-club',
    authorName: 'Ocean Grove Surf Life Saving Club',
    price: 25,
    currency: 'AUD',
    location: {
      lat: -38.2675,
      lng: 144.5263,
      address: 'Ocean Grove Main Beach, Ocean Grove VIC',
    },
    images: ['/images/surf-comp.jpg'],
    status: 'active',
    visibility: 'public',
    createdAt: new Date('2025-05-20'),
    updatedAt: new Date('2025-05-20'),
    tags: ['surfing', 'competition', 'beach', 'sport', 'prizes'],
  },
];

export default function EventsPage() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'free' | 'paid'>('all');

  const filteredEvents = eventPosts.filter(event => {
    if (activeFilter === 'free') return !event.price;
    if (activeFilter === 'paid') return event.price;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Community Events
            </h1>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Discover what&apos;s happening around the Bellarine Peninsula. From markets and festivals 
              to workshops and community gatherings - there&apos;s always something exciting to join.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="mt-8 flex justify-center">
            <div className="bg-gray-100 p-1 rounded-lg inline-flex">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeFilter === 'all'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                All Events ({eventPosts.length})
              </button>
              <button
                onClick={() => setActiveFilter('free')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeFilter === 'free'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Free Events ({eventPosts.filter(e => !e.price).length})
              </button>
              <button
                onClick={() => setActiveFilter('paid')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeFilter === 'paid'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Ticketed Events ({eventPosts.filter(e => e.price).length})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PostsGrid 
          posts={filteredEvents}
          title=""
          showFilters={false}
          showCreateButton={true}
          emptyMessage="No events match your filter. Check back later or organize your own event!"
        />

        {/* Call to Action */}
        <div className="mt-16 text-center bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Organizing an event?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Share your community event with everyone on the Bellarine Peninsula. From small gatherings 
            to large festivals, help build our vibrant community calendar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/community/create?category=events&type=event"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Create Event
            </Link>
            <button className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors">
              View Event Guidelines
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
