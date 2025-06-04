'use client';

import { useState } from 'react';
import PostCard from './PostCard';
import { CommunityPost } from '@/types';
import {
  AdjustmentsHorizontalIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  TagIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { toDate } from '@/lib/utils';

interface PostsGridProps {
  posts: CommunityPost[];
  title?: string;
  showFilters?: boolean;
  showCreateButton?: boolean;
  emptyMessage?: string;
  layout?: 'grid' | 'list';
  context?: 'events' | 'jobs' | undefined; // Add context prop
}

/**
 * PostsGrid displays a list of community posts with optional filters and layout options.
 * @param posts - Array of CommunityPost objects to display
 * @param title - Optional title for the grid
 * @param showFilters - Whether to show the filter/search bar
 * @param showCreateButton - Whether to show the create post button
 * @param emptyMessage - Message to display when no posts are found
 * @param layout - 'grid' or 'list' layout
 */
export default function PostsGrid({
  posts,
  title = 'Community Posts',
  showFilters = true,
  showCreateButton = true,
  emptyMessage = 'No posts found',
  layout = 'grid',
  context,
}: PostsGridProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<
    | 'created_desc'
    | 'created_asc'
    | 'updated_desc'
    | 'updated_asc'
    | 'name_asc'
    | 'name_desc'
    | 'eventDate_asc'
    | 'eventDate_desc'
    | 'startDate_asc'
    | 'startDate_desc'
  >('created_desc');
  const [currentLayout, setCurrentLayout] = useState<'grid' | 'list'>(layout);

  const categories = [
    'all',
    'deals',
    'events',
    'marketplace',
    'free_items',
    'help_requests',
    'community',
    'food',
    'services',
    'jobs',
  ];

  let filteredPosts = posts
    .filter(
      post =>
        searchQuery === '' ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(
      post => !selectedCategory || selectedCategory === 'all' || post.category === selectedCategory
    );

  const sortOptions = [
    { value: 'created_desc', label: 'Newest' },
    { value: 'created_asc', label: 'Oldest' },
    { value: 'updated_desc', label: 'Recently Modified' },
    { value: 'updated_asc', label: 'Least Recently Modified' },
    { value: 'name_asc', label: 'Name (A-Z)' },
    { value: 'name_desc', label: 'Name (Z-A)' },
  ];
  if (context === 'events') {
    sortOptions.push(
      { value: 'eventDate_asc', label: 'Event Date (Soonest)' },
      { value: 'eventDate_desc', label: 'Event Date (Latest)' }
    );
  }
  if (context === 'jobs') {
    sortOptions.push(
      { value: 'startDate_asc', label: 'Start Date (Soonest)' },
      { value: 'startDate_desc', label: 'Start Date (Latest)' }
    );
  }

  // Sorting logic
  filteredPosts = [...filteredPosts].sort((a, b) => {
    switch (sortBy) {
      case 'name_asc':
        return a.title.localeCompare(b.title);
      case 'name_desc':
        return b.title.localeCompare(a.title);
      case 'created_asc':
        return (a.createdAt?.getTime?.() || 0) - (b.createdAt?.getTime?.() || 0);
      case 'created_desc':
        return (b.createdAt?.getTime?.() || 0) - (a.createdAt?.getTime?.() || 0);
      case 'updated_asc':
        return (a.updatedAt?.getTime?.() || 0) - (b.updatedAt?.getTime?.() || 0);
      case 'updated_desc':
        return (b.updatedAt?.getTime?.() || 0) - (a.updatedAt?.getTime?.() || 0);
      case 'eventDate_asc':
        return (toDate(a.eventDate).getTime() || 0) - (toDate(b.eventDate).getTime() || 0);
      case 'eventDate_desc':
        return (toDate(b.eventDate).getTime() || 0) - (toDate(a.eventDate).getTime() || 0);
      case 'startDate_asc':
        return (toDate(a.startDate).getTime() || 0) - (toDate(b.startDate).getTime() || 0);
      case 'startDate_desc':
        return (toDate(b.startDate).getTime() || 0) - (toDate(a.startDate).getTime() || 0);
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h2>
        <div className="flex gap-2 items-center">
          <SortDropdown sortBy={sortBy} setSortBy={setSortBy} sortOptions={sortOptions} />
          <LayoutToggle currentLayout={currentLayout} setCurrentLayout={setCurrentLayout} />
          {showCreateButton && (
            <Link
              href="/community/create"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors w-full sm:w-auto"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Post
            </Link>
          )}
        </div>
      </div>
      {showFilters && (
        <PostsGridFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={categories}
        />
      )}
      {filteredPosts.length === 0 ? (
        <PostsGridEmpty message={emptyMessage} />
      ) : (
        <div
          className={
            currentLayout === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'
              : 'space-y-4 sm:space-y-6'
          }
          data-testid="posts-grid"
        >
          {filteredPosts.map(post => (
            <PostGridCard key={post.id} post={post} context={context} />
          ))}
        </div>
      )}
    </div>
  );
}

// Sort dropdown component
function SortDropdown({
  sortBy,
  setSortBy,
  sortOptions,
}: {
  sortBy: string;
  setSortBy: (v: any) => void;
  sortOptions: { value: string; label: string }[];
}) {
  return (
    <select
      className="block pl-3 pr-8 py-2 text-sm border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md min-w-0 sm:min-w-[140px]"
      value={sortBy}
      onChange={e => setSortBy(e.target.value)}
      aria-label="Sort posts"
    >
      {sortOptions.map(opt => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

/**
 * Filter and search bar for PostsGrid
 */
interface PostsGridFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  categories: string[];
}

function PostsGridFilters({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  categories,
}: PostsGridFiltersProps) {
  return (
    <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200 space-y-3 sm:space-y-4">
      <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon
              className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400"
              aria-hidden="true"
            />
          </div>
          <input
            type="text"
            placeholder="Search posts..."
            className="block w-full pl-9 sm:pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center">
          <AdjustmentsHorizontalIcon
            className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mr-2"
            aria-hidden="true"
          />
          <select
            className="block w-full sm:w-auto pl-3 pr-8 sm:pr-10 py-2 text-sm border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md min-w-0 sm:min-w-[140px]"
            value={selectedCategory || 'all'}
            onChange={e => setSelectedCategory(e.target.value === 'all' ? null : e.target.value)}
            aria-label="Filter by category"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

/**
 * Empty state for PostsGrid
 */
interface PostsGridEmptyProps {
  message: string;
}

function PostsGridEmpty({ message }: PostsGridEmptyProps) {
  return (
    <div className="bg-white p-6 sm:p-8 rounded-lg shadow-sm border border-gray-200 text-center">
      <p className="text-sm sm:text-base text-gray-600">{message}</p>
    </div>
  );
}

// Grid card for PostsGrid (shows event date or job start date if context is set)
function PostGridCard({ post, context }: { post: CommunityPost; context?: 'events' | 'jobs' }) {
  // Always link to /community/[postId] for all posts
  const href = `/community/${post.id}`;

  return (
    <Link
      href={href}
      className="block group focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
    >
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow p-3 sm:p-4 group-hover:border-blue-500">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-semibold text-gray-900 line-clamp-1 flex-1 mr-2 group-hover:text-blue-700">
              {post.title}
            </h3>
            {context === 'events' && post.eventDate && (
              <span className="text-xs font-medium text-blue-700 whitespace-nowrap">
                {toDate(post.eventDate).toLocaleDateString()}
              </span>
            )}
            {context === 'jobs' && post.startDate && (
              <span className="text-xs font-medium text-blue-700 whitespace-nowrap">
                {toDate(post.startDate).toLocaleDateString()}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{post.description}</p>
          <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-500">
            <span className="flex items-center">
              <TagIcon className="h-3 w-3 mr-1" />
              {post.category}
            </span>
            {post.location && (
              <span className="flex items-center">
                <MapPinIcon className="h-3 w-3 mr-1" />
                <span className="truncate">{post.location.address}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

// Layout toggle component
function LayoutToggle({
  currentLayout,
  setCurrentLayout,
}: {
  currentLayout: 'grid' | 'list';
  setCurrentLayout: (v: 'grid' | 'list') => void;
}) {
  return (
    <div className="flex gap-1 ml-2">
      <button
        type="button"
        className={`px-2 py-1 rounded-md border text-xs font-medium ${currentLayout === 'grid' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}`}
        onClick={() => setCurrentLayout('grid')}
        aria-label="Grid view"
      >
        Grid
      </button>
      <button
        type="button"
        className={`px-2 py-1 rounded-md border text-xs font-medium ${currentLayout === 'list' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}`}
        onClick={() => setCurrentLayout('list')}
        aria-label="List view"
      >
        List
      </button>
    </div>
  );
}
