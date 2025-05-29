export interface User {
  id: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  isVerified: boolean;
  verificationStatus: 'pending' | 'approved' | 'rejected' | 'none';
  address?: {
    street: string;
    suburb: string;
    postcode: string;
    state: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  joinedAt: Date;
  lastActive: Date;
}

export interface CommunityPost {
  id: string;
  title: string;
  description: string;
  category: PostCategory;
  type: PostType;
  authorId: string;
  authorName: string;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  images?: string[];
  price?: number;
  currency?: string;
  status: 'active' | 'completed' | 'expired' | 'removed';
  visibility: 'public' | 'verified_only';
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  tags: string[];
}

export type PostCategory =
  | 'deals'
  | 'events'
  | 'marketplace'
  | 'free_items'
  | 'help_requests'
  | 'community'
  | 'food'
  | 'services';

export type PostType = 'offer' | 'request' | 'announcement' | 'event' | 'sale' | 'free' | 'help';

export interface Event {
  id: string;
  title: string;
  description: string;
  organizer: string;
  organizerId: string;
  location: {
    name: string;
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  startDate: Date;
  endDate: Date;
  isRecurring: boolean;
  recurrencePattern?: string;
  category: string;
  tags: string[];
  image?: string;
  ticketPrice?: number;
  maxAttendees?: number;
  currentAttendees: number;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Business {
  id: string;
  name: string;
  description: string;
  category: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  contact: {
    phone?: string;
    email?: string;
    website?: string;
  };
  hours: {
    [key: string]: {
      open: string;
      close: string;
      isClosed: boolean;
    };
  };
  images: string[];
  ownerId: string;
  isVerified: boolean;
  rating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Donation {
  id: string;
  amount: number;
  currency: string;
  donorId?: string;
  donorName: string;
  message?: string;
  isAnonymous: boolean;
  paymentIntentId: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  isEdited: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  actionUrl?: string;
  createdAt: Date;
}
