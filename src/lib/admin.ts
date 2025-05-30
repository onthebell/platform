import { User, UserRole, AdminPermission, AdminPermissions } from '@/types';

/**
 * Default permissions for each role
 */
export const ROLE_PERMISSIONS: Record<UserRole, AdminPermission[]> = {
  user: [],
  moderator: ['manage_posts', 'manage_reports'],
  admin: [
    'manage_posts',
    'manage_users',
    'manage_reports',
    'manage_events',
    'manage_businesses',
    'view_analytics',
  ],
  super_admin: [
    'manage_posts',
    'manage_users',
    'manage_reports',
    'manage_events',
    'manage_businesses',
    'view_analytics',
    'manage_moderators',
  ],
};

/**
 * Check if a user has admin privileges (moderator or above)
 */
export function isAdmin(user: User | null): boolean {
  if (!user) return false;
  return ['moderator', 'admin', 'super_admin'].includes(user.role);
}

/**
 * Check if a user has a specific permission
 */
export function hasPermission(user: User | null, permission: AdminPermission): boolean {
  if (!user || !isAdmin(user)) return false;

  // Check role-based permissions first
  const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
  if (rolePermissions.includes(permission)) return true;

  // Check custom permissions
  return user.permissions?.includes(permission) || false;
}

/**
 * Get all permissions for a user
 */
export function getUserPermissions(user: User | null): AdminPermissions {
  const basePermissions: AdminPermissions = {
    canManagePosts: false,
    canManageUsers: false,
    canManageReports: false,
    canManageEvents: false,
    canManageBusinesses: false,
    canViewAnalytics: false,
    canManageModerators: false,
  };

  if (!user || !isAdmin(user)) return basePermissions;

  return {
    canManagePosts: hasPermission(user, 'manage_posts'),
    canManageUsers: hasPermission(user, 'manage_users'),
    canManageReports: hasPermission(user, 'manage_reports'),
    canManageEvents: hasPermission(user, 'manage_events'),
    canManageBusinesses: hasPermission(user, 'manage_businesses'),
    canViewAnalytics: hasPermission(user, 'view_analytics'),
    canManageModerators: hasPermission(user, 'manage_moderators'),
  };
}

/**
 * Check if a user can access the admin panel
 */
export function canAccessAdminPanel(user: User | null): boolean {
  return isAdmin(user);
}

/**
 * Check if a user can perform admin actions on another user
 */
export function canManageUser(adminUser: User | null, targetUser: User): boolean {
  if (!adminUser || !isAdmin(adminUser)) return false;

  // Super admins can manage anyone
  if (adminUser.role === 'super_admin') return true;

  // Admins can manage moderators and users, but not other admins
  if (adminUser.role === 'admin') {
    return ['user', 'moderator'].includes(targetUser.role);
  }

  // Moderators can only manage regular users
  if (adminUser.role === 'moderator') {
    return targetUser.role === 'user';
  }

  return false;
}

/**
 * Get role hierarchy level (higher number = more powerful role)
 */
export function getRoleLevel(role: UserRole): number {
  const levels: Record<UserRole, number> = {
    user: 0,
    moderator: 1,
    admin: 2,
    super_admin: 3,
  };
  return levels[role] || 0;
}

/**
 * Check if one role is higher than another
 */
export function isHigherRole(role1: UserRole, role2: UserRole): boolean {
  return getRoleLevel(role1) > getRoleLevel(role2);
}

/**
 * Get available roles that a user can assign to others
 */
export function getAssignableRoles(adminUser: User | null): UserRole[] {
  if (!adminUser || !isAdmin(adminUser)) return [];

  switch (adminUser.role) {
    case 'super_admin':
      return ['user', 'moderator', 'admin'];
    case 'admin':
      return ['user', 'moderator'];
    case 'moderator':
      return ['user'];
    default:
      return [];
  }
}

/**
 * Format role name for display
 */
export function formatRoleName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    user: 'User',
    moderator: 'Moderator',
    admin: 'Administrator',
    super_admin: 'Super Administrator',
  };
  return roleNames[role] || 'Unknown';
}

/**
 * Format permission name for display
 */
export function formatPermissionName(permission: AdminPermission): string {
  const permissionNames: Record<AdminPermission, string> = {
    manage_posts: 'Manage Posts',
    manage_users: 'Manage Users',
    manage_reports: 'Manage Reports',
    manage_events: 'Manage Events',
    manage_businesses: 'Manage Businesses',
    view_analytics: 'View Analytics',
    manage_moderators: 'Manage Moderators',
  };
  return permissionNames[permission] || permission;
}
