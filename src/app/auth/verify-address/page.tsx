'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth';
import {
  submitAddressVerification,
  getUserVerificationStatus,
  validateBellarineAddress,
  getBellarineSuburbs,
  getBellarinePostcodes,
  parseAddressString,
} from '@/lib/firebase/verification';
import { uploadImage, validateImageFile } from '@/lib/firebase/storage';
import {
  DocumentIcon,
  MapPinIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

export default function VerifyAddressPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<{
    hasRequest: boolean;
    status?: 'pending' | 'approved' | 'rejected';
    verificationId?: string;
  }>({ hasRequest: false });
  const [proofDocument, setProofDocument] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    street: '',
    suburb: '',
    postcode: '',
    state: 'VIC',
    country: 'Australia',
    addressString: '',
  });

  const suburbs = getBellarineSuburbs();
  const postcodes = getBellarinePostcodes();

  const checkVerificationStatus = useCallback(async () => {
    if (!user) return;

    try {
      const status = await getUserVerificationStatus(user.id);
      setVerificationStatus(status);
    } catch (error) {
      console.error('Error checking verification status:', error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      checkVerificationStatus();
    }
  }, [user, checkVerificationStatus]);

  const handleAddressStringChange = (addressString: string) => {
    setFormData(prev => ({ ...prev, addressString }));

    if (addressString.length > 10) {
      const parsed = parseAddressString(addressString);
      setFormData(prev => ({
        ...prev,
        street: parsed.street || prev.street,
        suburb: parsed.suburb || prev.suburb,
        postcode: parsed.postcode || prev.postcode,
        state: parsed.state || prev.state,
        country: parsed.country || prev.country,
      }));
    }
  };

  const handleProofDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.isValid) {
      alert(validation.error);
      return;
    }

    setProofDocument(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);

    try {
      // Validate address
      const validation = validateBellarineAddress({
        suburb: formData.suburb,
        postcode: formData.postcode,
        state: formData.state,
        country: formData.country,
      });

      if (!validation.isValid) {
        alert(validation.error);
        return;
      }

      // Upload proof document if provided
      let proofDocumentUrl: string | undefined;
      if (proofDocument) {
        proofDocumentUrl = await uploadImage(proofDocument, 'verification', user.id);
      }

      // Submit verification request
      await submitAddressVerification(
        user.id,
        user.email,
        {
          street: formData.street,
          suburb: formData.suburb,
          postcode: formData.postcode,
          state: formData.state,
          country: formData.country,
        },
        proofDocumentUrl
      );

      alert(
        "Address verification request submitted successfully! We'll review it within 2-3 business days."
      );

      // Refresh verification status
      await checkVerificationStatus();
    } catch (error) {
      console.error('Error submitting verification:', error);
      alert('Failed to submit verification request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-3 sm:px-4">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Sign In Required</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-6">
            You need to be signed in to verify your address.
          </p>
          <button
            onClick={() => router.push('/auth/signin')}
            className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-md hover:bg-blue-700 text-sm sm:text-base w-full sm:w-auto"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <MapPinIcon className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Address Verification</h1>
            </div>
            <p className="text-gray-600">
              Verify your Bellarine Peninsula address to access verified resident features and
              connect with your local community.
            </p>
          </div>

          {/* Verification Status */}
          {verificationStatus.hasRequest && (
            <div
              className={`mb-8 p-4 rounded-lg border ${
                verificationStatus.status === 'approved'
                  ? 'bg-green-50 border-green-200'
                  : verificationStatus.status === 'pending'
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-center">
                {verificationStatus.status === 'approved' && (
                  <>
                    <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-green-800 font-medium">Address Verified</span>
                  </>
                )}
                {verificationStatus.status === 'pending' && (
                  <>
                    <ClockIcon className="h-5 w-5 text-yellow-600 mr-2" />
                    <span className="text-yellow-800 font-medium">Verification Pending</span>
                  </>
                )}
                {verificationStatus.status === 'rejected' && (
                  <>
                    <XCircleIcon className="h-5 w-5 text-red-600 mr-2" />
                    <span className="text-red-800 font-medium">Verification Rejected</span>
                  </>
                )}
              </div>
              <p className="mt-2 text-sm text-gray-600">
                {verificationStatus.status === 'approved' &&
                  'Your address has been verified. You now have access to all verified resident features.'}
                {verificationStatus.status === 'pending' &&
                  "We're reviewing your address verification. This usually takes 2-3 business days."}
                {verificationStatus.status === 'rejected' &&
                  'Your verification was rejected. Please check your address details and try again with valid proof of residence.'}
              </p>
            </div>
          )}

          {/* Form (only show if not already approved) */}
          {verificationStatus.status !== 'approved' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Address String Input */}
              <div>
                <label
                  htmlFor="addressString"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Full Address
                </label>
                <textarea
                  id="addressString"
                  rows={3}
                  value={formData.addressString}
                  onChange={e => handleAddressStringChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your full address (e.g., 123 Main Street, Ocean Grove, VIC 3226)"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Enter your complete address and we'll help parse it into the fields below.
                </p>
              </div>

              {/* Parsed Address Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    id="street"
                    required
                    value={formData.street}
                    onChange={e => setFormData(prev => ({ ...prev, street: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="123 Main Street"
                  />
                </div>

                <div>
                  <label htmlFor="suburb" className="block text-sm font-medium text-gray-700 mb-2">
                    Suburb *
                  </label>
                  <select
                    id="suburb"
                    required
                    value={formData.suburb}
                    onChange={e => setFormData(prev => ({ ...prev, suburb: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a suburb</option>
                    {suburbs.map(suburb => (
                      <option key={suburb} value={suburb}>
                        {suburb}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="postcode"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Postcode *
                  </label>
                  <select
                    id="postcode"
                    required
                    value={formData.postcode}
                    onChange={e => setFormData(prev => ({ ...prev, postcode: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select postcode</option>
                    {postcodes.map(postcode => (
                      <option key={postcode} value={postcode}>
                        {postcode}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    id="state"
                    required
                    value={formData.state}
                    onChange={e => setFormData(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="VIC"
                  />
                </div>

                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                    Country *
                  </label>
                  <input
                    type="text"
                    id="country"
                    required
                    value={formData.country}
                    onChange={e => setFormData(prev => ({ ...prev, country: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Australia"
                  />
                </div>
              </div>

              {/* Proof Document Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proof of Address (Optional but Recommended)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <label htmlFor="proof-document" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                          Upload proof of address
                        </span>
                        <span className="block text-sm text-gray-500">
                          Utility bill, bank statement, or government letter (PDF, JPG, PNG)
                        </span>
                        <input
                          id="proof-document"
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleProofDocumentChange}
                          className="sr-only"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {proofDocument && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-center">
                      <DocumentIcon className="h-5 w-5 text-green-600 mr-2" />
                      <span className="text-sm text-green-800">{proofDocument.name}</span>
                    </div>
                  </div>
                )}

                <div className="mt-2 text-sm text-gray-500">
                  <p>Accepted documents include:</p>
                  <ul className="list-disc list-inside mt-1">
                    <li>Utility bills (electricity, gas, water)</li>
                    <li>Bank or credit card statements</li>
                    <li>Government correspondence</li>
                    <li>Council rates notice</li>
                  </ul>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || verificationStatus.status === 'pending'}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit for Verification'}
                </button>
              </div>
            </form>
          )}

          {/* Benefits Section */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Verified Resident Benefits</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <CheckCircleIcon className="h-4 w-4 text-green-600 mr-2" />
                Access to verified-only community discussions
              </li>
              <li className="flex items-center">
                <CheckCircleIcon className="h-4 w-4 text-green-600 mr-2" />
                Priority listing in local marketplace
              </li>
              <li className="flex items-center">
                <CheckCircleIcon className="h-4 w-4 text-green-600 mr-2" />
                Neighborhood-specific events and updates
              </li>
              <li className="flex items-center">
                <CheckCircleIcon className="h-4 w-4 text-green-600 mr-2" />
                Enhanced credibility with verified badge
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
