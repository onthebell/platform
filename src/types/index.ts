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
  createdAt: Date;
  updatedAt: Date;
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
  metadata?: Record<string, any>;
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
