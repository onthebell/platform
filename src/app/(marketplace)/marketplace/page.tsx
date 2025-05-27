'use client';

import { useState } from 'react';
import Link from 'next/link';
import PostsGrid from '@/components/community/PostsGrid';
import { CommunityPost } from '@/types';

// Sample marketplace data
const marketplacePosts: CommunityPost[] = [
  {
    id: 'mp1',
    title: 'Vintage Raleigh Bicycle',
    description: 'Beautiful vintage Raleigh bicycle from the 1970s. Recently restored with new chain, brakes, and tires. Perfect for leisurely rides around the Peninsula.',
    category: 'marketplace',
    type: 'sale',
    authorId: 'user1',
    authorName: 'Daniel Wilson',
    price: 350,
    currency: 'AUD',
    location: {
      lat: -38.1529,
      lng: 144.3627,
      address: 'Hill Street, Geelong',
    },
    images: ['/images/vintage-bicycle.jpg'],
    status: 'active',
    visibility: 'public',
    createdAt: new Date('2025-05-26'), // 1 day ago
    updatedAt: new Date('2025-05-26'),
    tags: ['bicycle', 'vintage', 'transport', 'restored'],
  },
  {
    id: 'mp2',
    title: 'Dining Table & Chairs Set',
    description: 'Solid wood dining table with 6 matching chairs. Some wear and tear but still very sturdy. Great for a family home or holiday house.',
    category: 'marketplace',
    type: 'sale',
    authorId: 'user2',
    authorName: 'Sarah Mitchell',
    price: 450,
    currency: 'AUD',
    location: {
      lat: -38.2654,
      lng: 144.6631,
      address: 'Queenscliff, VIC',
    },
    images: ['/images/dining-set.jpg'],
    status: 'active',
    visibility: 'public',
    createdAt: new Date('2025-05-25'), // 2 days ago
    updatedAt: new Date('2025-05-25'),
    tags: ['furniture', 'dining', 'wood', 'family'],
  },
  {
    id: 'mp3',
    title: 'Surfboard - 6\'2" Shortboard',
    description: 'Well-maintained 6\'2" shortboard, perfect for Point Danger or Thirteenth Beach. A few small dings but watertight.',
    category: 'marketplace',
    type: 'sale',
    authorId: 'user3',
    authorName: 'Jake Thompson',
    price: 280,
    currency: 'AUD',
    location: {
      lat: -38.2734,
      lng: 144.5151,
      address: 'Ocean Grove, VIC',
    },
    images: ['/images/surfboard.jpg'],
    status: 'active',
    visibility: 'public',
    createdAt: new Date('2025-05-24'),
    updatedAt: new Date('2025-05-24'),
    tags: ['surfboard', 'surf', 'beach', 'sport'],
  },
  {
    id: 'mp4',
    title: 'Garden Tools Bundle',
    description: 'Complete set of garden tools including spade, rake, hoe, secateurs, and hand tools. Perfect for maintaining your Peninsula garden.',
    category: 'marketplace',
    type: 'sale',
    authorId: 'user4',
    authorName: 'Margaret Green',
    price: 120,
    currency: 'AUD',
    location: {
      lat: -38.1889,
      lng: 144.4017,
      address: 'Portarlington, VIC',
    },
    images: ['/images/garden-tools-bundle.jpg'],
    status: 'active',
    visibility: 'public',
    createdAt: new Date('2025-05-23'),
    updatedAt: new Date('2025-05-23'),
    tags: ['garden', 'tools', 'bundle', 'outdoor'],
  },
  {
    id: 'mp5',
    title: 'Kids\' Playground Set',
    description: 'Wooden playground set with swing, slide, and climbing frame. Great condition, just outgrown by our kids. Easy to disassemble and transport.',
    category: 'marketplace',
    type: 'sale',
    authorId: 'user5',
    authorName: 'Amanda and Rob Foster',
    price: 800,
    currency: 'AUD',
    location: {
      lat: -38.2450,
      lng: 144.5989,
      address: 'Barwon Heads, VIC',
    },
    images: ['/images/playground-set.jpg'],
    status: 'active',
    visibility: 'public',
    createdAt: new Date('2025-05-22'),
    updatedAt: new Date('2025-05-22'),
    tags: ['kids', 'playground', 'outdoor', 'family'],
  },
  {
    id: 'mp6',
    title: 'Fishing Gear Collection',
    description: 'Various fishing rods, reels, tackle box, and nets. Perfect for fishing off the Queenscliff pier or trying your luck at the breakwater.',
    category: 'marketplace',
    type: 'sale',
    authorId: 'user6',
    authorName: 'Peter Marinos',
    price: 200,
    currency: 'AUD',
    location: {
      lat: -38.2654,
      lng: 144.6631,
      address: 'Queenscliff, VIC',
    },
    images: ['/images/fishing-gear.jpg'],
    status: 'active',
    visibility: 'public',
    createdAt: new Date('2025-05-21'),
    updatedAt: new Date('2025-05-21'),
    tags: ['fishing', 'gear', 'collection', 'pier'],
  },
];

const freePosts: CommunityPost[] = [
  {
    id: 'free1',
    title: 'Free Moving Boxes',
    description: 'About 20 moving boxes in various sizes, all in good condition. We\'ve finished our move and want to pass them on to someone who needs them.',
    category: 'free_items',
    type: 'free',
    authorId: 'user7',
    authorName: 'Chris and Emma Lee',
    location: {
      lat: -38.1599,
      lng: 144.3517,
      address: 'Bellarine Street, Geelong',
    },
    images: ['/images/moving-boxes.jpg'],
    status: 'active',
    visibility: 'public',
    createdAt: new Date('2025-05-26'),
    updatedAt: new Date('2025-05-26'),
    tags: ['boxes', 'moving', 'free', 'cardboard'],
  },
  {
    id: 'free2',
    title: 'Plant Cuttings & Seeds',
    description: 'Free native plant cuttings and vegetable seeds. Perfect for starting your Peninsula garden with local varieties.',
    category: 'free_items',
    type: 'free',
    authorId: 'user8',
    authorName: 'Bellarine Gardening Club',
    location: {
      lat: -38.2450,
      lng: 144.5989,
      address: 'Barwon Heads Community Centre',
    },
    images: ['/images/plant-cuttings.jpg'],
    status: 'active',
    visibility: 'public',
    createdAt: new Date('2025-05-25'),
    updatedAt: new Date('2025-05-25'),
    tags: ['plants', 'garden', 'native', 'seeds'],
  },
  {
    id: 'free3',
    title: 'Old Magazines & Books',
    description: 'Collection of magazines and paperback books, mostly travel and cooking. Free to anyone who wants them for reading or craft projects.',
    category: 'free_items',
    type: 'free',
    authorId: 'user9',
    authorName: 'Linda Jackson',
    location: {
      lat: -38.1889,
      lng: 144.4017,
      address: 'Portarlington, VIC',
    },
    images: ['/images/books-magazines.jpg'],
    status: 'active',
    visibility: 'public',
    createdAt: new Date('2025-05-24'),
    updatedAt: new Date('2025-05-24'),
    tags: ['books', 'magazines', 'reading', 'craft'],
  },
];

export default function MarketplacePage() {
  const [activeTab, setActiveTab] = useState<'for-sale' | 'free'>('for-sale');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Bellarine Marketplace
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Buy, sell, and share items with your local community. From furniture to free plants, 
            find what you need or give away what you don&apos;t.
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
