import PostsGrid from '@/components/community/PostsGrid';
import { CommunityPost } from '@/types';

// This would come from the database in a real implementation
const samplePosts: CommunityPost[] = [
  {
    id: '1',
    title: 'Weekly Farmers Market',
    description: 'Join us every Saturday for the Bellarine Farmers Market featuring local produce, crafts, and food vendors.',
    category: 'events',
    type: 'announcement',
    authorId: 'user1',
    authorName: 'Sarah Johnson',
    location: {
      lat: -38.1499,
      lng: 144.3617,
      address: 'Waterfront Plaza, Geelong',
    },
    images: ['/images/farmers-market.jpg'],
    status: 'active',
    visibility: 'public',
    createdAt: new Date('2025-05-25'), // 2 days ago
    updatedAt: new Date('2025-05-25'),
    tags: ['market', 'local', 'food', 'community'],
  },
  {
    id: '2',
    title: 'Free Garden Tools',
    description: 'I\'m giving away some garden tools I no longer need, including a rake, shovel, and garden hose. All in good condition.',
    category: 'free_items',
    type: 'offer',
    authorId: 'user2',
    authorName: 'Michael Brown',
    location: {
      lat: -38.1599,
      lng: 144.3517,
      address: 'Bellarine Street, Geelong',
    },
    images: ['/images/garden-tools.jpg'],
    status: 'active',
    visibility: 'verified_only',
    createdAt: new Date(Date.now() - 86400000), // 1 day ago
    updatedAt: new Date(Date.now() - 86400000),
    tags: ['gardening', 'free', 'tools'],
  },
  {
    id: '3',
    title: 'Looking for Plumber Recommendations',
    description: 'Can anyone recommend a good plumber for a bathroom renovation? Preferably someone who has experience with older homes.',
    category: 'help_requests',
    type: 'request',
    authorId: 'user3',
    authorName: 'Lisa Anderson',
    status: 'active',
    visibility: 'public',
    createdAt: new Date(Date.now() - 3600000 * 5), // 5 hours ago
    updatedAt: new Date(Date.now() - 3600000 * 5),
    tags: ['help', 'plumbing', 'renovation', 'recommendations'],
  },
  {
    id: '4',
    title: '50% Off at Coastal Cafe',
    description: 'Coastal Cafe is offering 50% off all coffee drinks this weekend to celebrate their 5th anniversary!',
    category: 'deals',
    type: 'announcement',
    authorId: 'user4',
    authorName: 'Coastal Cafe',
    location: {
      lat: -38.1649,
      lng: 144.3557,
      address: 'Ocean View Rd, Geelong',
    },
    images: ['/images/coastal-cafe.jpg'],
    status: 'active',
    visibility: 'public',
    createdAt: new Date(Date.now() - 3600000 * 10), // 10 hours ago
    updatedAt: new Date(Date.now() - 3600000 * 10),
    tags: ['coffee', 'cafe', 'discount', 'local business'],
  },
  {
    id: '5',
    title: 'Vintage Bicycle for Sale',
    description: 'Selling my vintage Raleigh bicycle from the 1970s. Recently restored and in excellent condition. $350 or best offer.',
    category: 'marketplace',
    type: 'sale',
    authorId: 'user5',
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
    createdAt: new Date(Date.now() - 86400000 * 3), // 3 days ago
    updatedAt: new Date(Date.now() - 86400000 * 3),
    tags: ['bicycle', 'vintage', 'for sale', 'restored'],
  },
  {
    id: '6',
    title: 'Community Beach Cleanup',
    description: 'Join us for a community beach cleanup this Sunday from 9am-12pm. All equipment will be provided, just bring a water bottle and sunscreen!',
    category: 'community',
    type: 'event',
    authorId: 'user6',
    authorName: 'Bellarine Environmental Group',
    location: {
      lat: -38.1609,
      lng: 144.3747,
      address: 'Eastern Beach, Geelong',
    },
    images: ['/images/beach-cleanup.jpg'],
    status: 'active',
    visibility: 'public',
    createdAt: new Date(Date.now() - 86400000 * 4), // 4 days ago
    updatedAt: new Date(Date.now() - 86400000 * 4),
    tags: ['environment', 'cleanup', 'volunteer', 'beach'],
  },
];

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Community</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Connect with your Bellarine Peninsula community. Browse local events, marketplace items,
            and connect with your neighbors.
          </p>
        </div>

        <PostsGrid 
          posts={samplePosts} 
          title="Community Posts"
          showFilters={true}
          showCreateButton={true}
        />
      </div>
    </div>
  );
}
