import { NextRequest, NextResponse } from 'next/server';
import {
  getAuthUser,
  getAllUsers,
  updateUserAsAdmin,
  deleteUserAsAdmin,
} from '@/lib/firebase/admin';
import { requireAuth } from '@/lib/utils/auth';
import { isAdmin, hasPermission, canManageUser } from '@/lib/admin';
import type { User } from '@/types';
import { UserRole, AdminPermission } from '@/types';

// GET /api/admin/users - Get all users with pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const user = await requireAuth(request);
    if (!isAdmin(user)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    if (!hasPermission(user, 'manage_users')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Parse query parameters
    const pageSize = parseInt(searchParams.get('limit') || '50');
    const nextPageToken = searchParams.get('nextPageToken') || undefined;

    const result = await getAllUsers(pageSize, nextPageToken);

    return NextResponse.json({
      users: result.users,
      nextPageToken: result.nextPageToken,
      hasMore: !!result.nextPageToken,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

// PUT /api/admin/users - Update user (role, suspension, etc.)
export async function PUT(request: NextRequest) {
  try {
    const admin = await requireAuth(request);
    if (!isAdmin(admin)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { userId, action, ...updateData } = await request.json();

    if (!userId || !action) {
      return NextResponse.json({ error: 'User ID and action are required' }, { status: 400 });
    }

    // Get the target user
    const targetUser = await getAuthUser(userId);
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if admin can manage this user
    if (!canManageUser(admin, targetUser)) {
      return NextResponse.json(
        { error: 'Cannot manage user with equal or higher role' },
        { status: 403 }
      );
    }

    const updates: Partial<User> = {};

    switch (action) {
      case 'updateRole':
        if (!hasPermission(admin, 'manage_users')) {
          return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
        }

        const { role, permissions } = updateData;
        if (role) updates.role = role as UserRole;
        if (permissions) updates.permissions = permissions as AdminPermission[];
        break;

      case 'suspend':
        if (!hasPermission(admin, 'manage_users')) {
          return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
        }

        const { reason, duration } = updateData;
        updates.isSuspended = true;
        updates.suspensionReason = reason;

        if (duration && duration > 0) {
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + duration);
          updates.suspensionExpiresAt = expiresAt;
        }
        break;

      case 'unsuspend':
        if (!hasPermission(admin, 'manage_users')) {
          return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
        }

        updates.isSuspended = false;
        updates.suspensionReason = undefined;
        updates.suspensionExpiresAt = undefined;
        break;

      case 'verify':
        if (!hasPermission(admin, 'manage_users')) {
          return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
        }

        updates.isVerified = true;
        updates.verificationStatus = 'approved';
        break;

      case 'unverify':
        if (!hasPermission(admin, 'manage_users')) {
          return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
        }

        updates.isVerified = false;
        updates.verificationStatus = 'none';
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    await updateUserAsAdmin(userId, updates);

    return NextResponse.json({
      success: true,
      message: `User ${action} completed successfully`,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

// DELETE /api/admin/users - Delete user
export async function DELETE(request: NextRequest) {
  try {
    const admin = await requireAuth(request);
    if (!isAdmin(admin)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    if (!hasPermission(admin, 'manage_users')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get the target user
    const targetUser = await getAuthUser(userId);
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if admin can manage this user
    if (!canManageUser(admin, targetUser)) {
      return NextResponse.json(
        { error: 'Cannot delete user with equal or higher role' },
        { status: 403 }
      );
    }

    await deleteUserAsAdmin(userId);

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
