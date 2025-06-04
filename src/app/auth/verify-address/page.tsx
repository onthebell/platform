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
  generatePostalCode,
} from '@/lib/firebase/verification';
import { uploadImage, validateImageFile } from '@/lib/firebase/storage';
import { authenticatedFetch } from '@/lib/utils/api';
import AddressAutocomplete from '@/components/ui/AddressAutocomplete';
import { getStripe } from '@/lib/stripe/config';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import {
  DocumentIcon,
  MapPinIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';
import { VerificationMethod } from '../../../types';

// Stripe Elements styling
const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#9e2146',
    },
  },
};

function PostalVerificationPayment({
  onPaymentSuccess,
  address,
  onCancel,
  isLoading,
  setIsLoading,
}: {
  onPaymentSuccess: (paymentIntentId: string) => void;
  address: any;
  onCancel: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handlePayment = async () => {
    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setPaymentError(null);

    try {
      // Create payment intent
      const response = await authenticatedFetch('/api/verification/postal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create-payment-intent',
          address,
        }),
      });

      const responseData = await response.json();
      console.log('Payment intent response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const { clientSecret, paymentIntentId } = responseData;

      if (!clientSecret) {
        throw new Error('Failed to create payment intent: No client secret received');
      }

      // Confirm payment
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { error } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (error) {
        setPaymentError(error.message || 'Payment failed');
      } else {
        onPaymentSuccess(paymentIntentId);
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentError('Payment failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 border border-gray-300 rounded-md">
        <CardElement options={cardElementOptions} />
      </div>

      {paymentError && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">{paymentError}</div>
      )}

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handlePayment}
          disabled={!stripe || isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Processing...' : 'Pay $5.00 AUD'}
        </button>
      </div>
    </div>
  );
}

export default function VerifyAddressPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<VerificationMethod | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<{
    hasRequest: boolean;
    status?: 'pending' | 'approved' | 'rejected';
    verificationId?: string;
    method?: VerificationMethod;
  }>({ hasRequest: false });
  const [proofDocument, setProofDocument] = useState<File | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
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
  const stripePromise = getStripe();

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

  const validateAddress = () => {
    const validation = validateBellarineAddress({
      suburb: formData.suburb,
      postcode: formData.postcode,
      state: formData.state,
      country: formData.country,
    });

    if (!validation.isValid) {
      alert(validation.error);
      return false;
    }
    return true;
  };

  const handleDocumentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !validateAddress()) return;

    setIsSubmitting(true);

    try {
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
        'document',
        proofDocumentUrl
      );

      alert(
        "Address verification request submitted successfully! We'll review it within 2-3 business days. Your document will be automatically deleted after verification."
      );

      // Refresh verification status
      await checkVerificationStatus();
      setSelectedMethod(null);
    } catch (error) {
      console.error('Error submitting verification:', error);
      alert('Failed to submit verification request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePostalPaymentSuccess = async (paymentIntentId: string) => {
    if (!user || !validateAddress()) return;

    setPaymentIntentId(paymentIntentId);
    setPaymentSuccess(true);
    setShowPayment(false);

    try {
      // Generate a verification code for postal method
      const verificationCode = generatePostalCode();

      // Submit postal verification request
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
        'postal',
        undefined, // No proof document for postal method
        verificationCode, // Generated verification code
        paymentIntentId
      );

      alert(
        'Payment successful! Your verification code will be mailed to your address within 5-7 business days. Please check the field below when you receive it.'
      );

      // Refresh verification status
      await checkVerificationStatus();
    } catch (error) {
      console.error('Error submitting postal verification:', error);
      alert('Payment processed but verification request failed. Please contact support.');
    }
  };

  const handleCodeVerification = async () => {
    if (!verificationCode.trim()) {
      alert('Please enter your verification code');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await authenticatedFetch('/api/verification/postal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'verify-code',
          code: verificationCode.trim(),
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert('Address verified successfully!');
        await checkVerificationStatus();
        setVerificationCode('');
        setPaymentSuccess(false);
      } else {
        alert(result.error || 'Invalid or expired verification code');
      }
    } catch (error) {
      console.error('Error verifying code:', error);
      alert('Failed to verify code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50 flex items-center justify-center px-3 sm:px-4">
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
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <MapPinIcon className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">Address Verification</h1>
          </div>
          <p className="text-gray-600">
            Verify your Bellarine Peninsula address to access verified resident features and connect
            with your local community.
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
                verificationStatus.method === 'document' &&
                "We're reviewing your document verification. This usually takes 2-3 business days."}
              {verificationStatus.status === 'pending' &&
                verificationStatus.method === 'postal' &&
                'Your verification code has been mailed to your address. Please enter the code below when you receive it (usually takes 5-7 business days).'}
              {verificationStatus.status === 'rejected' &&
                'Your verification was rejected. Please check your address details and try again with valid proof of residence.'}
            </p>
          </div>
        )}

        {/* Code Verification for Completed Postal Payment */}
        {(paymentSuccess ||
          (verificationStatus.hasRequest && verificationStatus.method === 'postal')) &&
          verificationStatus.status === 'pending' && (
            <div className="mb-8 bg-blue-50 border border-blue-200 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Enter Verification Code</h3>
              <p className="text-blue-800 mb-4">
                A verification code has been mailed to your address. Please enter it below when you
                receive it.
              </p>
              <div className="flex gap-4">
                <input
                  type="text"
                  value={verificationCode}
                  onChange={e => setVerificationCode(e.target.value.toUpperCase())}
                  placeholder="Enter 8-character code"
                  maxLength={8}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleCodeVerification}
                  disabled={isSubmitting || verificationCode.length !== 8}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Verifying...' : 'Verify'}
                </button>
              </div>
            </div>
          )}

        {/* Verification Method Selection or Form */}
        {verificationStatus.status !== 'approved' &&
          !paymentSuccess &&
          !(
            verificationStatus.hasRequest &&
            verificationStatus.method === 'postal' &&
            verificationStatus.status === 'pending'
          ) && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {!selectedMethod ? (
                // Method Selection
                <div className="p-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Choose Verification Method
                  </h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Document Upload Method */}
                    <div className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors">
                      <div className="flex items-center mb-4">
                        <DocumentIcon className="h-8 w-8 text-blue-600 mr-3" />
                        <h3 className="text-lg font-semibold text-gray-900">Document Upload</h3>
                      </div>
                      <p className="text-gray-600 mb-4">
                        Upload a photo of an official document showing your name and Bellarine
                        Peninsula address.
                      </p>
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Benefits:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Free verification</li>
                          <li>• Usually approved within 2-3 business days</li>
                          <li>• Documents automatically deleted after verification</li>
                        </ul>
                      </div>
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Privacy Protection:</h4>
                        <div className="flex items-start">
                          <EyeSlashIcon className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                          <p className="text-sm text-green-700">
                            You can blur or redact sensitive information (except name and address)
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedMethod('document')}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                      >
                        Choose Document Upload
                      </button>
                    </div>

                    {/* Postal Verification Method */}
                    <div className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors">
                      <div className="flex items-center mb-4">
                        <CreditCardIcon className="h-8 w-8 text-green-600 mr-3" />
                        <h3 className="text-lg font-semibold text-gray-900">Postal Verification</h3>
                      </div>
                      <p className="text-gray-600 mb-4">
                        We'll mail a verification code to your address. No documents required.
                      </p>
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Benefits:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• No personal documents needed</li>
                          <li>• Maximum privacy protection</li>
                          <li>• Instant payment processing</li>
                        </ul>
                      </div>
                      <div className="mb-4">
                        <div className="flex items-center">
                          <ShieldCheckIcon className="h-4 w-4 text-green-600 mr-2" />
                          <span className="text-sm text-green-700 font-medium">
                            100% Private & Secure
                          </span>
                        </div>
                      </div>
                      <div className="text-center mb-4">
                        <span className="text-2xl font-bold text-gray-900">$5.00 AUD</span>
                        <span className="text-sm text-gray-500 block">
                          One-time verification fee
                        </span>
                      </div>
                      <button
                        onClick={() => setSelectedMethod('postal')}
                        className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
                      >
                        Choose Postal Verification
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                // Selected Method Form
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {selectedMethod === 'document'
                        ? 'Document Upload Verification'
                        : 'Postal Code Verification'}
                    </h2>
                    <button
                      onClick={() => {
                        setSelectedMethod(null);
                        setShowPayment(false);
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Change Method
                    </button>
                  </div>

                  {/* Address Form */}
                  <form
                    onSubmit={
                      selectedMethod === 'document'
                        ? handleDocumentSubmit
                        : e => {
                            e.preventDefault();
                            if (validateAddress()) {
                              setShowPayment(true);
                            }
                          }
                    }
                    className="space-y-6"
                  >
                    {/* Address String Input */}
                    <div>
                      <label
                        htmlFor="addressString"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Full Address
                      </label>
                      <AddressAutocomplete
                        value={formData.addressString}
                        onChange={(address: string, coordinates?: { lat: number; lng: number }) => {
                          handleAddressStringChange(address);
                        }}
                        placeholder="Enter your full address (e.g., 123 Main Street, Ocean Grove, VIC 3226)"
                        className=""
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Enter your complete address and we'll help parse it into the fields below.
                      </p>
                    </div>

                    {/* Parsed Address Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label
                          htmlFor="street"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Street Address *
                        </label>
                        <AddressAutocomplete
                          value={formData.street}
                          onChange={(address: string) => {
                            setFormData(prev => ({ ...prev, street: address }));
                          }}
                          placeholder="123 Main Street"
                          required
                          className=""
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="suburb"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
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
                          onChange={e =>
                            setFormData(prev => ({ ...prev, postcode: e.target.value }))
                          }
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
                        <label
                          htmlFor="state"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
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
                        <label
                          htmlFor="country"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Country *
                        </label>
                        <input
                          type="text"
                          id="country"
                          required
                          value={formData.country}
                          onChange={e =>
                            setFormData(prev => ({ ...prev, country: e.target.value }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Australia"
                        />
                      </div>
                    </div>

                    {/* Document Upload (only for document method) */}
                    {selectedMethod === 'document' && (
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

                        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                          <div className="flex items-start">
                            <EyeSlashIcon className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                            <div>
                              <h4 className="text-sm font-semibold text-blue-900">
                                Privacy Protection
                              </h4>
                              <p className="text-sm text-blue-800 mt-1">
                                You may redact or blur any sensitive information except your name
                                and address. Documents are automatically deleted from our servers
                                after verification.
                              </p>
                            </div>
                          </div>
                        </div>

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
                    )}

                    {/* Payment Section for Postal Method */}
                    {selectedMethod === 'postal' && showPayment && (
                      <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Payment Details
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Complete your payment to have a verification code mailed to your address.
                        </p>
                        <Elements stripe={stripePromise}>
                          <PostalVerificationPayment
                            onPaymentSuccess={handlePostalPaymentSuccess}
                            address={formData}
                            onCancel={() => setShowPayment(false)}
                            isLoading={isSubmitting}
                            setIsLoading={setIsSubmitting}
                          />
                        </Elements>
                      </div>
                    )}

                    {/* Submit Button */}
                    {!showPayment && (
                      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                        <button
                          type="button"
                          onClick={() => setSelectedMethod(null)}
                          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting || verificationStatus.status === 'pending'}
                          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                          {isSubmitting
                            ? 'Submitting...'
                            : selectedMethod === 'document'
                              ? 'Submit for Verification'
                              : 'Proceed to Payment'}
                        </button>
                      </div>
                    )}
                  </form>
                </div>
              )}
            </div>
          )}

        {/* Benefits Section */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-8">
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
  );
}
