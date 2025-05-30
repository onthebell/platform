'use client';

import { useState } from 'react';
import { ReportReason } from '@/types';
import { FlagIcon } from '@heroicons/react/24/outline';
import ReportModal from './ReportModal';

interface ReportButtonProps {
  contentType: 'post' | 'comment' | 'user';
  contentId: string;
  contentAuthorId: string;
  className?: string;
  size?: 'sm' | 'md';
}

export default function ReportButton({
  contentType,
  contentId,
  contentAuthorId,
  className = '',
  size = 'md',
}: ReportButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitReport = async (data: {
    reason: ReportReason;
    customReason?: string;
    description?: string;
  }) => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentType,
          contentId,
          contentAuthorId,
          ...data,
        }),
      });

      if (response.ok) {
        // Show success message
        alert('Report submitted successfully. Thank you for helping keep our community safe.');
        return true;
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to submit report. Please try again.');
        return false;
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report. Please try again.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`text-gray-400 hover:text-red-500 transition-colors ${sizeClasses[size]} ${className}`}
        title={`Report ${contentType}`}
        disabled={isSubmitting}
      >
        <FlagIcon className={iconSizes[size]} />
      </button>

      <ReportModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        contentType={contentType}
        contentId={contentId}
        contentAuthorId={contentAuthorId}
        onSubmit={handleSubmitReport}
      />
    </>
  );
}
