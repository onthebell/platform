import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/firebase/auth';
import { isAdmin, hasPermission } from '@/lib/admin';
import {
  AdminStats,
  ContentReport,
  User,
  CommunityPost,
  AdminPermission,
  ModerationAction,
} from '@/types';
import { authenticatedFetch } from '@/lib/utils/api';

/**
 * Custom hook for admin authentication and permissions.
 * @returns An object containing the current user, loading state, admin status, permission checkers, and admin capabilities.
 */
export function useAdminAuth() {
  const { user, loading } = useAuth();

  const isUserAdmin = user ? isAdmin(user) : false;
  const checkPermission = (permission: AdminPermission) =>
    user ? hasPermission(user, permission) : false;

  return {
    user,
    loading,
    isAdmin: isUserAdmin,
    hasPermission: checkPermission,
    canManagePosts: checkPermission('manage_posts'),
    canManageUsers: checkPermission('manage_users'),
    canModerateContent: checkPermission('manage_reports'),
    canViewReports: checkPermission('manage_reports'),
    canManageSystem: checkPermission('view_analytics'),
  };
}

/**
 * Hook for fetching admin dashboard statistics.
 * @returns An object with dashboard stats, loading state, error, and a refetch function.
 */
export function useAdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchStats = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const response = await authenticatedFetch('/api/admin/dashboard');

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard statistics');
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
}

/**
 * Hook for managing admin posts (fetch, update, delete).
 * @returns An object with posts, loading state, error, pagination, and CRUD functions.
 */
export function useAdminPosts() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [lastId, setLastId] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchPosts = async (
    options: {
      status?: string;
      authorId?: string;
      startAfter?: string;
      limit?: number;
      reset?: boolean;
    } = {}
  ) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (options.status) params.set('status', options.status);
      if (options.authorId) params.set('authorId', options.authorId);
      if (options.startAfter) params.set('startAfter', options.startAfter);
      if (options.limit) params.set('limit', options.limit.toString());

      const response = await authenticatedFetch(`/api/admin/posts?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }

      const data = await response.json();

      if (options.reset) {
        setPosts(data.posts);
      } else {
        setPosts(prev => [...prev, ...data.posts]);
      }

      setHasMore(data.hasMore);
      setLastId(data.lastId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const updatePost = async (postId: string, action: string, reason?: string) => {
    if (!user) return false;

    try {
      const response = await authenticatedFetch('/api/admin/posts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId, action, reason }),
      });

      if (!response.ok) {
        throw new Error('Failed to update post');
      }

      // Update local state
      setPosts(prev =>
        prev.map(post => {
          if (post.id === postId) {
            const updates: Partial<CommunityPost> = { updatedAt: new Date() };
            if (action === 'hide') updates.isHidden = true;
            if (action === 'restore') {
              updates.isHidden = false;
              updates.isDeleted = false;
            }
            if (action === 'delete') updates.isDeleted = true;
            return { ...post, ...updates };
          }
          return post;
        })
      );

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    }
  };

  const deletePost = async (postId: string) => {
    if (!user) return false;

    try {
      const response = await authenticatedFetch(`/api/admin/posts?postId=${postId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete post');
      }

      // Remove from local state
      setPosts(prev => prev.filter(post => post.id !== postId));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    }
  };

  return {
    posts,
    loading,
    error,
    hasMore,
    fetchPosts,
    updatePost,
    deletePost,
    loadMore: () => fetchPosts({ startAfter: lastId || undefined }),
  };
}

/**
 * Hook for managing admin users (fetch, update).
 * @returns An object with users, loading state, error, pagination, and update function.
 */
export function useAdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchUsers = async (
    options: {
      limit?: number;
      nextPageToken?: string;
      reset?: boolean;
    } = {}
  ) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (options.limit) params.set('limit', options.limit.toString());
      if (options.nextPageToken) params.set('nextPageToken', options.nextPageToken);

      const response = await authenticatedFetch(`/api/admin/users?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();

      if (options.reset) {
        setUsers(data.users);
      } else {
        setUsers(prev => [...prev, ...data.users]);
      }

      setHasMore(data.hasMore);
      setNextPageToken(data.nextPageToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userId: string, action: string, updateData?: Partial<User>) => {
    if (!user) return false;

    try {
      const response = await authenticatedFetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, action, ...updateData }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      // Refresh the users list
      await fetchUsers({ reset: true });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    }
  };

  return {
    users,
    loading,
    error,
    hasMore,
    fetchUsers,
    updateUser,
    loadMore: () => fetchUsers({ nextPageToken: nextPageToken || undefined }),
  };
}

/**
 * Hook for managing admin content reports (fetch, update).
 * @returns An object with reports, loading state, error, pagination, and update function.
 */
export function useAdminReports() {
  const [reports, setReports] = useState<ContentReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [lastId, setLastId] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchReports = async (
    options: {
      status?: string;
      contentType?: string;
      startAfter?: string;
      limit?: number;
      reset?: boolean;
    } = {}
  ) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (options.status) params.set('status', options.status);
      if (options.contentType) params.set('contentType', options.contentType);
      if (options.startAfter) params.set('startAfter', options.startAfter);
      if (options.limit) params.set('limit', options.limit.toString());

      const response = await authenticatedFetch(`/api/admin/reports?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }

      const data = await response.json();

      if (options.reset) {
        setReports(data.reports);
      } else {
        setReports(prev => [...prev, ...data.reports]);
      }

      setHasMore(data.hasMore);
      setLastId(data.lastId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const updateReport = async (
    reportId: string,
    action: string,
    reason?: string,
    notes?: string
  ) => {
    if (!user) return false;

    try {
      const response = await authenticatedFetch('/api/admin/reports', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reportId, action, reason, notes }),
      });

      if (!response.ok) {
        throw new Error('Failed to update report');
      }

      // Update local state
      setReports(prev =>
        prev.map(report => {
          if (report.id === reportId) {
            return {
              ...report,
              status: action === 'dismiss' ? 'dismissed' : 'resolved',
              moderatorId: user.id,
              moderatorName: user.displayName || user.email,
              moderatorAction: action as ModerationAction,
              moderatorReason: reason,
              moderatorNotes: notes,
              updatedAt: new Date(),
              resolvedAt: new Date(),
            };
          }
          return report;
        })
      );

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    }
  };

  return {
    reports,
    loading,
    error,
    hasMore,
    fetchReports,
    updateReport,
    loadMore: () => fetchReports({ startAfter: lastId || undefined }),
  };
}
