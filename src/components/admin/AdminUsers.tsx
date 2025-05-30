import { useState, useEffect } from 'react';
import { useAdminUsers, useAdminAuth } from '@/hooks/useAdmin';
import { User, UserRole, AdminPermission } from '@/types';
import { formatRoleName, getAssignableRoles } from '@/lib/admin';
import {
  UserIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  TrashIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';

interface UserCardProps {
  user: User;
  onUpdate: (id: string, action: string, data?: any) => Promise<boolean>;
  currentUser: User;
}

function UserCard({ user, onUpdate, currentUser }: UserCardProps) {
  const [showActions, setShowActions] = useState(false);
  const [editingRole, setEditingRole] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(user.role);
  const [suspensionReason, setSuspensionReason] = useState('');
  const [suspensionDuration, setSuspensionDuration] = useState('7');
  const [actionLoading, setActionLoading] = useState(false);

  const handleRoleUpdate = async () => {
    setActionLoading(true);
    const success = await onUpdate(user.id, 'updateRole', { role: selectedRole });
    if (success) {
      setEditingRole(false);
    }
    setActionLoading(false);
  };

  const handleSuspension = async () => {
    if (!suspensionReason.trim()) {
      alert('Please provide a reason for suspension');
      return;
    }

    setActionLoading(true);
    const success = await onUpdate(user.id, 'suspend', {
      reason: suspensionReason,
      duration: parseInt(suspensionDuration),
    });
    if (success) {
      setShowActions(false);
      setSuspensionReason('');
    }
    setActionLoading(false);
  };

  const handleUnsuspend = async () => {
    setActionLoading(true);
    const success = await onUpdate(user.id, 'unsuspend');
    setActionLoading(false);
  };

  const handleVerification = async (verify: boolean) => {
    setActionLoading(true);
    const success = await onUpdate(user.id, verify ? 'verify' : 'unverify');
    setActionLoading(false);
  };

  const assignableRoles = getAssignableRoles(currentUser);
  const canEdit = currentUser.id !== user.id; // Can't edit self

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200">
      <div className="p-6">
        {/* User Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || user.email}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <span className="text-lg font-medium text-blue-600">
                  {(user.displayName || user.email)[0].toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {user.displayName || user.email}
              </h3>
              <p className="text-sm text-gray-500">{user.email}</p>
              <p className="text-xs text-gray-400">
                Joined{' '}
                {(() => {
                  if (!user.joinedAt) return 'Unknown';
                  try {
                    const date =
                      user.joinedAt instanceof Date ? user.joinedAt : new Date(user.joinedAt);
                    if (isNaN(date.getTime())) return 'Unknown';
                    return formatDistanceToNow(date, { addSuffix: true });
                  } catch {
                    return 'Unknown';
                  }
                })()}
              </p>
            </div>
          </div>

          {/* Status badges */}
          <div className="flex flex-col items-end space-y-2">
            <div className="flex items-center space-x-2">
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  user.role === 'super_admin'
                    ? 'bg-purple-100 text-purple-800'
                    : user.role === 'admin'
                      ? 'bg-blue-100 text-blue-800'
                      : user.role === 'moderator'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                }`}
              >
                {formatRoleName(user.role)}
              </span>
              {user.isVerified && (
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                  Verified
                </span>
              )}
              {user.isSuspended && (
                <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                  Suspended
                </span>
              )}
            </div>
            <span className="text-xs text-gray-400">ID: {user.id?.slice(-6) || 'Unknown'}</span>
          </div>
        </div>

        {/* User Details */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <span className="text-gray-600">Last Active:</span>
            <span className="ml-2 text-gray-900">
              {(() => {
                if (!user.lastActive) return 'Unknown';
                try {
                  const date =
                    user.lastActive instanceof Date ? user.lastActive : new Date(user.lastActive);
                  if (isNaN(date.getTime())) return 'Unknown';
                  return formatDistanceToNow(date, { addSuffix: true });
                } catch {
                  return 'Unknown';
                }
              })()}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Verification:</span>
            <span className="ml-2 text-gray-900 capitalize">{user.verificationStatus}</span>
          </div>
          {user.address && (
            <div className="col-span-2">
              <span className="text-gray-600">Address:</span>
              <span className="ml-2 text-gray-900">
                {user.address.suburb}, {user.address.postcode}
              </span>
            </div>
          )}
          {user.isSuspended && user.suspensionReason && (
            <div className="col-span-2">
              <span className="text-gray-600">Suspension Reason:</span>
              <span className="ml-2 text-gray-900">{user.suspensionReason}</span>
              {user.suspensionExpiresAt && (
                <div className="text-xs text-gray-500 mt-1">
                  Expires: {new Date(user.suspensionExpiresAt).toLocaleDateString()}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        {canEdit && (
          <div className="border-t border-gray-200 pt-4">
            {!showActions && !editingRole ? (
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowActions(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Manage User
                </button>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setEditingRole(true)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Edit role"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  {user.isVerified ? (
                    <button
                      onClick={() => handleVerification(false)}
                      disabled={actionLoading}
                      className="p-2 text-gray-400 hover:text-yellow-600 transition-colors disabled:opacity-50"
                      title="Remove verification"
                    >
                      <ShieldExclamationIcon className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleVerification(true)}
                      disabled={actionLoading}
                      className="p-2 text-gray-400 hover:text-green-600 transition-colors disabled:opacity-50"
                      title="Verify user"
                    >
                      <ShieldCheckIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ) : editingRole ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={selectedRole}
                    onChange={e => setSelectedRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    {assignableRoles.map(role => (
                      <option key={role} value={role}>
                        {formatRoleName(role)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => {
                      setEditingRole(false);
                      setSelectedRole(user.role);
                    }}
                    className="text-sm text-gray-600 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRoleUpdate}
                    disabled={actionLoading || selectedRole === user.role}
                    className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    Update Role
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {!user.isSuspended ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Suspension Reason
                      </label>
                      <input
                        type="text"
                        value={suspensionReason}
                        onChange={e => setSuspensionReason(e.target.value)}
                        placeholder="Reason for suspension..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Duration (days)
                      </label>
                      <select
                        value={suspensionDuration}
                        onChange={e => setSuspensionDuration(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="1">1 day</option>
                        <option value="3">3 days</option>
                        <option value="7">1 week</option>
                        <option value="14">2 weeks</option>
                        <option value="30">1 month</option>
                        <option value="0">Permanent</option>
                      </select>
                    </div>
                  </>
                ) : null}

                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setShowActions(false)}
                    className="text-sm text-gray-600 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                  <div className="flex items-center space-x-2">
                    {user.isSuspended ? (
                      <button
                        onClick={handleUnsuspend}
                        disabled={actionLoading}
                        className="px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50"
                      >
                        Unsuspend
                      </button>
                    ) : (
                      <button
                        onClick={handleSuspension}
                        disabled={actionLoading}
                        className="px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50"
                      >
                        Suspend
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const { users, loading, error, hasMore, fetchUsers, updateUser, loadMore } = useAdminUsers();
  const { user: currentUser } = useAdminAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    fetchUsers({ reset: true });
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      searchTerm === '' ||
      user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  if (!currentUser) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
          <p className="text-sm text-gray-600 mt-1">Manage user accounts, roles, and permissions</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Roles</option>
            <option value="user">Users</option>
            <option value="moderator">Moderators</option>
            <option value="admin">Admins</option>
            <option value="super_admin">Super Admins</option>
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Users List */}
      <div className="space-y-4">
        {filteredUsers.map(user => (
          <UserCard key={user.id} user={user} currentUser={currentUser} onUpdate={updateUser} />
        ))}

        {filteredUsers.length === 0 && !loading && (
          <div className="text-center py-12">
            <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-600">
              {searchTerm || roleFilter !== 'all'
                ? 'No users match your search criteria.'
                : 'No users have been registered yet.'}
            </p>
          </div>
        )}

        {/* Load More */}
        {hasMore && filteredUsers.length > 0 && (
          <div className="text-center">
            <button
              onClick={loadMore}
              disabled={loading}
              className="px-6 py-3 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Loading...' : 'Load More Users'}
            </button>
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && users.length === 0 && (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="flex items-start space-x-3 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
