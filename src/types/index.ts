import type { FieldValue } from 'firebase/firestore';

export interface User {
  id: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  isVerified: boolean;
  verificationStatus: 'pending' | 'approved' | 'rejected' | 'none';
  verifiedAt?: Date;
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
  // Privacy settings
  privacySettings?: {
    profileVisibility: 'public' | 'verified_only' | 'private';
    allowFollowing: boolean;
    showInDiscovery: boolean;
  };
  // Notification preferences
  notificationPreferences?: {
    newPosts: {
      deals: boolean;
      events: boolean;
      marketplace: boolean;
      free_items: boolean;
      help_requests: boolean;
      community: boolean;
      food: boolean;
      services: boolean;
      jobs: boolean;
      offers: boolean;
      announcements: boolean;
      sales: boolean;
    };
    likes: boolean;
    comments: boolean;
    follows: boolean;
  };
  // Admin-related fields
  role: UserRole;
  permissions: AdminPermission[];
  isSuspended?: boolean;
  suspensionReason?: string;
  suspensionExpiresAt?: Date;
}

export type UserRole = 'user' | 'moderator' | 'admin' | 'super_admin';

export type AdminPermission =
  | 'manage_posts'
  | 'manage_users'
  | 'manage_reports'
  | 'manage_events'
  | 'manage_businesses'
  | 'view_analytics'
  | 'manage_moderators';

export interface CommunityPost {
  id: string;
  title: string;
  description: string;
  content?: string; // Full content/body text for admin moderation
  category: PostCategory;
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
  // Job-specific fields
  startDate?: Date; // For jobs - when the job starts
  jobType?: JobType; // Type of job (full_time, part_time, etc.)
  industry?: string; // Industry/sector for the job
  employerType?: 'business' | 'person'; // Whether posted by business or individual
  workType?: 'onsite' | 'remote' | 'hybrid'; // Work location type

  // Event-specific fields
  eventDate?: Date; // Date and time of the event
  eventEndDate?: Date; // End date for multi-day events
  eventType?: 'workshop' | 'meeting' | 'festival' | 'market' | 'sport' | 'social' | 'other';
  capacity?: number; // Maximum number of attendees

  // Request/Help-specific fields
  urgency?: 'low' | 'medium' | 'high'; // How urgent the request is
  deadline?: Date; // When the help/request is needed by
  budget?: number; // Budget available for the request
  helpType?: 'one_time' | 'ongoing' | 'volunteer'; // Type of help needed

  // Sale/Marketplace-specific fields
  condition?: 'new' | 'like_new' | 'good' | 'fair' | 'poor'; // Condition of item
  brand?: string; // Brand of the item
  deliveryAvailable?: boolean; // Whether delivery is available
  pickupOnly?: boolean; // Whether pickup only

  // Offer-specific fields
  duration?: string; // How long the offer is valid
  termsConditions?: string; // Terms and conditions for the offer
  availability?: 'weekdays' | 'weekends' | 'flexible' | 'by_appointment'; // When offer is available

  // Announcement-specific fields
  announcementType?: 'info' | 'warning' | 'update' | 'reminder';
  importance?: 'low' | 'medium' | 'high'; // Importance level
  expiryDate?: Date; // When the announcement expires
  // Admin/moderation fields
  isHidden?: boolean;
  isDeleted?: boolean;
  moderationReason?: string;
  moderatedBy?: string;
  moderatedAt?: Date;
  // Engagement metrics
  likes?: number;
  commentCount?: number;
  views?: number;
}

export type PostCategory =
  | 'deals'
  | 'events'
  | 'marketplace'
  | 'free_items'
  | 'help_requests'
  | 'community'
  | 'food'
  | 'services'
  | 'jobs'
  | 'offers'
  | 'announcements'
  | 'sales';

export type JobType = 'full_time' | 'part_time' | 'one_off' | 'contract' | 'volunteer';

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

export interface SavedPost {
  id: string;
  userId: string;
  postId: string;
  postTitle: string;
  postCategory: PostCategory;
  savedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'like' | 'comment' | 'follow' | 'new_post';
  isRead: boolean;
  actionUrl?: string;
  createdAt: Date;
  // Specific notification data
  actorId?: string;
  actorName?: string;
  postId?: string;
  postTitle?: string;
  postCategory?: PostCategory;
  commentId?: string;
  commentPreview?: string;
  followingType?: 'user' | 'business';
}

// Content Reporting System
export interface ContentReport {
  id: string;
  reporterId: string;
  reporterName: string;
  contentType: 'post' | 'comment' | 'user';
  contentId: string;
  contentAuthorId: string;
  reason: ReportReason;
  customReason?: string;
  description?: string;
  status: ReportStatus;
  reviewedBy?: string;
  reviewedAt?: Date;
  moderatorNotes?: string;
  action?: ModerationAction;
  createdAt: Date | FieldValue;
  updatedAt: Date | FieldValue;
  // Moderation fields
  moderationReason?: string;
  moderatedBy?: string;
  moderatedAt?: Date;
  moderationAction?: ModerationAction;
}

export type ReportReason =
  | 'spam'
  | 'harassment'
  | 'hate_speech'
  | 'violence'
  | 'sexual_content'
  | 'misinformation'
  | 'inappropriate_content'
  | 'scam'
  | 'copyright_violation'
  | 'other';

export type ReportStatus = 'pending' | 'under_review' | 'resolved' | 'dismissed';

export type ModerationAction =
  | 'no_action'
  | 'content_removed'
  | 'content_hidden'
  | 'content_edited'
  | 'user_warned'
  | 'user_suspended'
  | 'user_banned';

// Admin Dashboard Types
export interface AdminStats {
  users: {
    total: number;
    verified: number;
    suspended: number;
    newThisWeek: number;
    newToday: number;
  };
  posts: {
    total: number;
    active: number;
    removed: number;
    hidden: number;
    newThisWeek: number;
    newToday: number;
  };
  reports: {
    pending: number;
    resolved: number;
    resolvedToday: number;
  };
  comments: {
    total: number;
  };
  activity: AdminActivity[];
}

export interface AdminActivity {
  id: string;
  adminId: string;
  adminName: string;
  action: AdminActionType;
  targetType: 'user' | 'post' | 'comment' | 'report';
  targetId: string;
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export type AdminActionType =
  | 'user_suspended'
  | 'user_unsuspended'
  | 'user_banned'
  | 'user_role_changed'
  | 'post_removed'
  | 'post_restored'
  | 'comment_removed'
  | 'comment_restored'
  | 'report_reviewed'
  | 'report_dismissed';

// Follow System
export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  followingType: 'user' | 'business';
  createdAt: Date;
}

export interface FollowStats {
  followersCount: number;
  followingCount: number;
}

export interface UserWithFollowStats extends User {
  followStats?: FollowStats;
  isFollowing?: boolean;
}

export interface BusinessWithFollowStats extends Business {
  followStats?: FollowStats;
  isFollowing?: boolean;
}

// Permission checking utilities
export interface AdminPermissions {
  canManagePosts: boolean;
  canManageUsers: boolean;
  canManageReports: boolean;
  canManageEvents: boolean;
  canManageBusinesses: boolean;
  canViewAnalytics: boolean;
  canManageModerators: boolean;
}

export type VerificationMethod = 'document' | 'postal';
