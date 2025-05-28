'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/firebase/auth';
import { useRouter } from 'next/navigation';
import { getBusiness } from '@/lib/firebase/firestore';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Business } from '@/types';
import BusinessForm from '@/components/business/BusinessForm';
import { Timestamp } from 'firebase/firestore';

interface EditBusinessPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditBusinessPage({ params }: EditBusinessPageProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [business, setBusiness] = useState<Business | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [businessId, setBusinessId] = useState<string>('');

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setBusinessId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  useEffect(() => {
    const fetchBusiness = async () => {
      if (!businessId) return;

      try {
        setIsLoading(true);
        const businessData = await getBusiness(businessId);

        if (!businessData) {
          setError('Business not found');
          return;
        }

        // Check if user owns this business
        if (businessData.ownerId !== user?.id) {
          setError('You are not authorized to edit this business');
          return;
        }

        setBusiness(businessData);
      } catch (err) {
        console.error('Error fetching business:', err);
        setError('Failed to load business data');
      } finally {
        setIsLoading(false);
      }
    };

    if (!loading && user) {
      fetchBusiness();
    } else if (!loading && !user) {
      router.push('/login');
    }
  }, [businessId, user, loading, router]);

  const handleUpdateBusiness = async (updatedBusiness: Business) => {
    try {
      const docRef = doc(db, 'businesses', businessId);
      await updateDoc(docRef, {
        ...updatedBusiness,
        updatedAt: Timestamp.fromDate(new Date()),
      });

      router.push('/business/dashboard?success=updated');
    } catch (err) {
      console.error('Error updating business:', err);
      setError('Failed to update business. Please try again.');
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading business data...</p>
        </div>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="mt-2 text-sm font-medium text-gray-900">Error</h3>
          <p className="mt-1 text-sm text-gray-500">{error || 'Business not found'}</p>
          <div className="mt-6">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Business</h1>
          <p className="mt-2 text-gray-600">
            Update your business information. Changes will be reviewed before going live.
          </p>
        </div>

        <BusinessForm business={business} onSubmit={handleUpdateBusiness} isEditing={true} />
      </div>
    </div>
  );
}
