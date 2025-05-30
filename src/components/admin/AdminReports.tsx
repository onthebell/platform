'use client';

import { useState, useEffect } from 'react';
import { useAdminReports } from '@/hooks/useAdmin';
import { ContentReport, ReportStatus, ModerationAction } from '@/types';
import {
  FlagIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeSlashIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  UserCircleIcon,
  DocumentTextIcon,
  ChatBubbleLeftIcon,
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';

interface ReportCardProps {
  report: ContentReport;
  onUpdate: (id: string, action: string, reason?: string, notes?: string) => Promise<boolean>;
}

function ReportCard({ report, onUpdate }: ReportCardProps) {
  const [showActions, setShowActions] = useState(false);
  const [selectedAction, setSelectedAction] = useState<ModerationAction>('no_action');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const handleAction = async () => {
    if (selectedAction !== 'no_action' && !reason.trim()) {
      alert('Please provide a reason for this action');
      return;
    }

    setActionLoading(true);
    const success = await onUpdate(report.id, selectedAction, reason, notes);
    if (success) {
      setShowActions(false);
      setReason('');
      setNotes('');
    }
    setActionLoading(false);
  };

  const getReasonDisplay = (reason: string) => {
    if (!reason) return 'Unknown Reason';
    return reason.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getContentTypeIcon = (type: string) => {
    if (!type) return <FlagIcon className="w-4 h-4" />; // Default icon

    switch (type) {
      case 'post':
        return <DocumentTextIcon className="w-4 h-4" />;
      case 'comment':
        return <ChatBubbleLeftIcon className="w-4 h-4" />;
      case 'user':
        return <UserCircleIcon className="w-4 h-4" />;
      default:
        return <FlagIcon className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: ReportStatus) => {
    if (!status) return 'bg-gray-100 text-gray-800'; // Default style

    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'dismissed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200">
      <div className="p-6">
        {/* Report Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">{getContentTypeIcon(report.contentType)}</div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {getReasonDisplay(report.reason)} - {report.contentType}
              </h3>
              <p className="text-sm text-gray-500">
                Reported by {report.reporterName || 'Anonymous'} •{' '}
                {(() => {
                  if (!report.createdAt) return 'Unknown';
                  try {
                    const date =
                      report.createdAt instanceof Date
                        ? report.createdAt
                        : new Date(report.createdAt);
                    if (isNaN(date.getTime())) return 'Unknown';
                    return formatDistanceToNow(date, { addSuffix: true });
                  } catch {
                    return 'Unknown';
                  }
                })()}
              </p>
            </div>
          </div>

          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}
          >
            {report.status}
          </span>
        </div>

        {/* Report Details */}
        <div className="space-y-3 mb-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Content ID:</span>
              <span className="ml-2 text-gray-900 font-mono">
                {report.contentId?.slice(-8) || 'Unknown'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Content Author:</span>
              <span className="ml-2 text-gray-900">
                {report.contentAuthorId?.slice(-8) || 'Unknown'}
              </span>
            </div>
          </div>

          {report.customReason && (
            <div>
              <span className="text-sm text-gray-600">Custom Reason:</span>
              <p className="text-sm text-gray-900 mt-1">{report.customReason}</p>
            </div>
          )}

          {report.description && (
            <div>
              <span className="text-sm text-gray-600">Description:</span>
              <p className="text-sm text-gray-900 mt-1">{report.description}</p>
            </div>
          )}

          {/* Moderation details if resolved */}
          {report.status !== 'pending' && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm">
                <p className="font-medium text-gray-900">
                  {report.status === 'resolved' ? 'Resolved' : 'Dismissed'} by{' '}
                  {report.reviewedBy || 'Admin'}
                </p>
                <p className="text-gray-600 mt-1">
                  Action: {report.action ? getReasonDisplay(report.action) : 'N/A'}
                </p>
                {report.moderatorNotes && (
                  <p className="text-gray-600 mt-1">Notes: {report.moderatorNotes}</p>
                )}
                {report.reviewedAt && (
                  <p className="text-xs text-gray-500 mt-2">
                    {(() => {
                      try {
                        const date =
                          report.reviewedAt instanceof Date
                            ? report.reviewedAt
                            : new Date(report.reviewedAt);
                        if (isNaN(date.getTime())) return 'Unknown';
                        return formatDistanceToNow(date, { addSuffix: true });
                      } catch {
                        return 'Unknown';
                      }
                    })()}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        {report.status === 'pending' && (
          <div className="border-t border-gray-200 pt-4">
            {!showActions ? (
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowActions(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Take Action
                </button>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onUpdate(report.id, 'no_action')}
                    className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
                  <select
                    value={selectedAction}
                    onChange={e => setSelectedAction(e.target.value as ModerationAction)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="no_action">Dismiss Report</option>
                    <option value="content_hidden">Hide Content</option>
                    <option value="content_removed">Delete Content</option>
                    <option value="user_warned">Warn User</option>
                    <option value="user_suspended">Suspend User</option>
                  </select>
                </div>

                {selectedAction !== 'no_action' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
                    <input
                      type="text"
                      value={reason}
                      onChange={e => setReason(e.target.value)}
                      placeholder="Reason for this action..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Additional notes..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setShowActions(false)}
                    className="text-sm text-gray-600 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAction}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {actionLoading ? 'Processing...' : 'Submit'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminReports() {
  const { reports, loading, error, hasMore, fetchReports, updateReport, loadMore } =
    useAdminReports();
  const [statusFilter, setStatusFilter] = useState<ReportStatus>('pending');
  const [contentTypeFilter, setContentTypeFilter] = useState('all');

  useEffect(() => {
    fetchReports({
      status: statusFilter,
      contentType: contentTypeFilter !== 'all' ? contentTypeFilter : undefined,
      reset: true,
    });
  }, [statusFilter, contentTypeFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports Management</h1>
          <p className="text-sm text-gray-600 mt-1">Review and moderate reported content</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <FlagIcon className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as ReportStatus)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>

          <select
            value={contentTypeFilter}
            onChange={e => setContentTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Content</option>
            <option value="post">Posts</option>
            <option value="comment">Comments</option>
            <option value="user">Users</option>
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Reports List */}
      <div className="space-y-4">
        {reports.map(report => (
          <ReportCard key={report.id} report={report} onUpdate={updateReport} />
        ))}

        {reports.length === 0 && !loading && (
          <div className="text-center py-12">
            <FlagIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
            <p className="text-gray-600">
              {statusFilter === 'pending'
                ? 'Great! No pending reports to review.'
                : `No ${statusFilter} reports match your criteria.`}
            </p>
          </div>
        )}

        {/* Load More */}
        {hasMore && reports.length > 0 && (
          <div className="text-center">
            <button
              onClick={loadMore}
              disabled={loading}
              className="px-6 py-3 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Loading...' : 'Load More Reports'}
            </button>
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && reports.length === 0 && (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="flex items-start space-x-3 mb-4">
                <div className="w-4 h-4 bg-gray-200 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
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
