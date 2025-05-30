import { useState } from 'react';
import { ReportReason } from '@/types';
import { FlagIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentType: 'post' | 'comment' | 'user';
  contentId: string;
  contentAuthorId: string;
  onSubmit: (data: {
    reason: ReportReason;
    customReason?: string;
    description?: string;
  }) => Promise<boolean>;
}

const reportReasons: { value: ReportReason; label: string; description: string }[] = [
  {
    value: 'spam',
    label: 'Spam',
    description: 'Repetitive, irrelevant, or promotional content',
  },
  {
    value: 'harassment',
    label: 'Harassment or Bullying',
    description: 'Targeting an individual with harmful behavior',
  },
  {
    value: 'hate_speech',
    label: 'Hate Speech',
    description: 'Content that promotes hatred against groups',
  },
  {
    value: 'violence',
    label: 'Violence or Threats',
    description: 'Content promoting or threatening violence',
  },
  {
    value: 'sexual_content',
    label: 'Sexual Content',
    description: 'Inappropriate sexual content',
  },
  {
    value: 'misinformation',
    label: 'Misinformation',
    description: 'False or misleading information',
  },
  {
    value: 'inappropriate_content',
    label: 'Inappropriate Content',
    description: 'Content not suitable for the community',
  },
  {
    value: 'scam',
    label: 'Scam or Fraud',
    description: 'Deceptive or fraudulent content',
  },
  {
    value: 'copyright_violation',
    label: 'Copyright Violation',
    description: 'Unauthorized use of copyrighted material',
  },
  {
    value: 'other',
    label: 'Other',
    description: 'Other reason not listed above',
  },
];

export default function ReportModal({
  isOpen,
  onClose,
  contentType,
  contentId,
  contentAuthorId,
  onSubmit,
}: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState<ReportReason>('spam');
  const [customReason, setCustomReason] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedReason === 'other' && !customReason.trim()) {
      alert('Please provide a custom reason');
      return;
    }

    setIsSubmitting(true);

    const success = await onSubmit({
      reason: selectedReason,
      customReason: selectedReason === 'other' ? customReason : undefined,
      description: description.trim() || undefined,
    });

    if (success) {
      // Reset form
      setSelectedReason('spam');
      setCustomReason('');
      setDescription('');
      onClose();
    }

    setIsSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <FlagIcon className="w-6 h-6 text-red-500" />
            <h2 className="text-lg font-semibold text-gray-900">Report {contentType}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-4">
              Help us keep OnTheBell safe by reporting content that violates our community
              guidelines.
            </p>
          </div>

          {/* Reason Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Why are you reporting this {contentType}?
            </label>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {reportReasons.map(reason => (
                <label
                  key={reason.value}
                  className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="reason"
                    value={reason.value}
                    checked={selectedReason === reason.value}
                    onChange={e => setSelectedReason(e.target.value as ReportReason)}
                    className="mt-1 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{reason.label}</p>
                    <p className="text-xs text-gray-500 mt-1">{reason.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Custom Reason (if "Other" selected) */}
          {selectedReason === 'other' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Please specify the reason *
              </label>
              <input
                type="text"
                value={customReason}
                onChange={e => setCustomReason(e.target.value)}
                placeholder="Briefly describe the issue..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          )}

          {/* Additional Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional details (optional)
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Provide any additional context that might help us review this report..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
