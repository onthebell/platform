'use client';

import { useState, useEffect } from 'react';
import { useAdminAuth } from '@/hooks/useAdmin';
import { AddressVerificationRequest } from '@/lib/firebase/verification';
import { deleteVerificationDocument } from '@/lib/firebase/verification';
import { authenticatedFetch } from '@/lib/utils/api';
import {
  DocumentIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  TrashIcon,
  ClockIcon,
  CreditCardIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';

interface VerificationWithId extends AddressVerificationRequest {
  id: string;
}

export default function AdminVerificationsPage() {
  const { user, loading: authLoading } = useAdminAuth();
  const [verifications, setVerifications] = useState<VerificationWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      loadVerifications();
    }
  }, [authLoading, user]);

  const loadVerifications = async () => {
    try {
      setLoading(true);
      const response = await authenticatedFetch('/api/admin/verifications');

      if (!response.ok) {
        throw new Error('Failed to load verifications');
      }

      const data = await response.json();
      setVerifications(data.requests || []);
    } catch (err) {
      console.error('Error loading verifications:', err);
      setError('Failed to load verifications');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationAction = async (
    verificationId: string,
    action: 'approve' | 'reject',
    notes?: string
  ) => {
    try {
      const response = await authenticatedFetch('/api/admin/verifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: verificationId,
          status: action === 'approve' ? 'approved' : 'rejected',
          adminNotes: notes,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update verification');
      }

      // Reload verifications
      await loadVerifications();

      // Show success message
      alert(`Verification ${action}d successfully`);
    } catch (err) {
      console.error('Error updating verification:', err);
      alert('Failed to update verification');
    }
  };

  const getMethodIcon = (method: 'document' | 'postal') => {
    return method === 'document' ? (
      <DocumentIcon className="h-5 w-5 text-blue-600" />
    ) : (
      <EnvelopeIcon className="h-5 w-5 text-green-600" />
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircleIcon className="h-5 w-5 text-red-600" />;
      default:
        return <ClockIcon className="h-5 w-5 text-yellow-600" />;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
        <button
          onClick={() => {
            setError(null);
            loadVerifications();
          }}
          className="mt-2 text-red-600 hover:text-red-700 font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Address Verifications</h1>
        <button
          onClick={loadVerifications}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-yellow-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {verifications.filter(v => v.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600">
                {verifications.filter(v => v.status === 'approved').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <XCircleIcon className="h-8 w-8 text-red-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-red-600">
                {verifications.filter(v => v.status === 'rejected').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Verifications List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {verifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <DocumentIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No verification requests found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {verifications.map(verification => (
              <div key={verification.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center space-x-3 mb-3">
                      {getMethodIcon(verification.method)}
                      {getStatusIcon(verification.status)}
                      <span className="text-sm font-medium text-gray-900">
                        {verification.method === 'document'
                          ? 'Document Upload'
                          : 'Postal Verification'}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          verification.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : verification.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {verification.status.charAt(0).toUpperCase() + verification.status.slice(1)}
                      </span>
                    </div>

                    {/* User Info */}
                    <div className="mb-3">
                      <p className="text-sm text-gray-600">
                        <strong>User:</strong> {verification.userEmail}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Submitted:</strong>{' '}
                        {formatDistanceToNow(new Date(verification.submittedAt))} ago
                      </p>
                    </div>

                    {/* Address */}
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-900 mb-1">Address:</p>
                      <p className="text-sm text-gray-600">
                        {verification.address.street}
                        <br />
                        {verification.address.suburb}, {verification.address.state}{' '}
                        {verification.address.postcode}
                        <br />
                        {verification.address.country}
                      </p>
                    </div>

                    {/* Method-specific info */}
                    {verification.method === 'document' && verification.proofDocument && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-900 mb-2">Proof Document:</p>
                        <div className="flex items-center space-x-2">
                          <img
                            src={verification.proofDocument}
                            alt="Proof document"
                            className="h-20 w-20 object-cover rounded border cursor-pointer"
                            onClick={() => setSelectedImage(verification.proofDocument!)}
                          />
                          <button
                            onClick={() => setSelectedImage(verification.proofDocument!)}
                            className="flex items-center text-blue-600 hover:text-blue-700 text-sm"
                          >
                            <EyeIcon className="h-4 w-4 mr-1" />
                            View Full Size
                          </button>
                        </div>
                        {verification.autoDeletedAt && (
                          <p className="text-xs text-gray-500 mt-1">
                            Document automatically deleted on{' '}
                            {new Date(verification.autoDeletedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    )}

                    {verification.method === 'postal' && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-900 mb-1">Postal Code:</p>
                        <p className="text-sm text-gray-600 font-mono">{verification.postalCode}</p>
                        {verification.postalCodeExpiry && (
                          <p className="text-xs text-gray-500">
                            Expires: {new Date(verification.postalCodeExpiry).toLocaleDateString()}
                          </p>
                        )}
                        {verification.paymentIntentId && (
                          <p className="text-xs text-gray-500">
                            Payment ID: {verification.paymentIntentId}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Review info */}
                    {verification.reviewedAt && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">
                          <strong>Reviewed by:</strong> {verification.reviewedBy || 'System'}
                          <br />
                          <strong>Reviewed:</strong>{' '}
                          {formatDistanceToNow(new Date(verification.reviewedAt))} ago
                        </p>
                        {verification.reviewNotes && (
                          <p className="text-sm text-gray-600 mt-1">
                            <strong>Notes:</strong> {verification.reviewNotes}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {verification.status === 'pending' && (
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => {
                          const notes = prompt('Add review notes (optional):');
                          handleVerificationAction(verification.id, 'approve', notes || undefined);
                        }}
                        className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 text-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          const notes = prompt('Add rejection reason:');
                          if (notes) {
                            handleVerificationAction(verification.id, 'reject', notes);
                          }
                        }}
                        className="bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 text-sm"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-4xl max-h-full">
            <img
              src={selectedImage}
              alt="Verification document"
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75"
            >
              <XCircleIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
