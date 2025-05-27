'use client';

import { useState } from 'react';
import PostCard from './PostCard';
import { CommunityPost } from '@/types';
import { 
  AdjustmentsHorizontalIcon, 
  MagnifyingGlassIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface PostsGridProps {
  posts: CommunityPost[];
  title?: string;
  showFilters?: boolean;
  showCreateButton?: boolean;
  emptyMessage?: string;
  layout?: 'grid' | 'list';
}

export default function PostsGrid({ 
  posts, 
  title = 'Community Posts',
  showFilters = true,
  showCreateButton = true,
  emptyMessage = 'No posts found',
  layout = 'grid'
}: PostsGridProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const categories = ['all', 'deals', 'events', 'marketplace', 'free_items', 'help_requests', 'community', 'food', 'services'];

  const filteredPosts = posts
    .filter(post => 
      (searchQuery === '' || 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .filter(post =>
      !selectedCategory || selectedCategory === 'all' || post.category === selectedCategory
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        
        {showCreateButton && (
          <Link
            href="/community/create"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Post
          </Link>
        )}
      </div>
      
      {showFilters && (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                placeholder="Search posts..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center">
              <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-400 mr-2" aria-hidden="true" />
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={selectedCategory || 'all'}
                onChange={(e) => setSelectedCategory(e.target.value === 'all' ? null : e.target.value)}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
      
      {filteredPosts.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
          <p className="text-gray-600">{emptyMessage}</p>
        </div>
      ) : (
        <div className={layout === 'grid' 
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" 
          : "space-y-6"
        }>
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} isCompact={layout === 'list'} />
          ))}
        </div>
      )}
    </div>
  );
}
