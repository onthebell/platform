'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth';
import { getPostById, updatePost } from '@/lib/firebase/firestore';
import { uploadImage, deleteImage, validateImageFile } from '@/lib/firebase/storage';
import { useContentModeration } from '@/hooks/useContentModeration';
import { CommunityPost, PostCategory, JobType } from '@/types';
import AddressAutocomplete from '@/components/ui/AddressAutocomplete';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import dynamic from 'next/dynamic';

// Dynamically import MapPicker to avoid SSR issues
const MapPicker = dynamic(() => import('@/components/map/MapPicker'), { ssr: false });

interface FormData {
  title: string;
  description: string;
  category: string;
  price?: string;
  currency: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  tags: string;
  visibility: 'public' | 'verified_only';
  // Job-specific fields
  startDate?: string;
  jobType?: JobType;
  industry?: string;
  employerType?: 'business' | 'person';
  workType?: 'onsite' | 'remote' | 'hybrid';
  // Event-specific fields
  eventDate?: string;
  eventEndDate?: string;
  eventType?: 'workshop' | 'meeting' | 'festival' | 'market' | 'sport' | 'social' | 'other';
  capacity?: string;
  // Request/Help-specific fields
  urgency?: 'low' | 'medium' | 'high';
  deadline?: string;
  budget?: string;
  helpType?: 'one_time' | 'ongoing' | 'volunteer';
  // Sale/Marketplace-specific fields
  condition?: 'new' | 'like_new' | 'good' | 'fair' | 'poor';
  brand?: string;
  deliveryAvailable?: boolean;
  pickupOnly?: boolean;
  // Offer-specific fields
  duration?: string;
  termsConditions?: string;
  availability?: 'weekdays' | 'weekends' | 'flexible' | 'by_appointment';
  // Announcement-specific fields
  announcementType?: 'info' | 'warning' | 'update' | 'reminder';
  importance?: 'low' | 'medium' | 'high';
  expiryDate?: string;
}

export default function EditPostPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const postId = params.postId as string;
  const { moderateContent, isLoading: isModerating } = useContentModeration();

  // Job options arrays
  const JOB_TYPES: { value: JobType; label: string }[] = [
    { value: 'full_time', label: 'Full Time' },
    { value: 'part_time', label: 'Part Time' },
    { value: 'one_off', label: 'One-off Job' },
    { value: 'contract', label: 'Contract' },
    { value: 'volunteer', label: 'Volunteer' },
  ];

  const INDUSTRIES: { value: string; label: string }[] = [
    { value: '', label: 'Select Industry (Optional)' },
    { value: 'Accommodation & Food Services', label: 'Accommodation & Food Services' },
    { value: 'Administrative & Support Services', label: 'Administrative & Support Services' },
    { value: 'Agriculture, Forestry & Fishing', label: 'Agriculture, Forestry & Fishing' },
    { value: 'Arts & Recreation Services', label: 'Arts & Recreation Services' },
    { value: 'Construction', label: 'Construction' },
    { value: 'Education & Training', label: 'Education & Training' },
    {
      value: 'Electricity, Gas, Water & Waste Services',
      label: 'Electricity, Gas, Water & Waste Services',
    },
    { value: 'Financial & Insurance Services', label: 'Financial & Insurance Services' },
    { value: 'Health Care & Social Assistance', label: 'Health Care & Social Assistance' },
    {
      value: 'Information Media & Telecommunications',
      label: 'Information Media & Telecommunications',
    },
    { value: 'Manufacturing', label: 'Manufacturing' },
    { value: 'Mining', label: 'Mining' },
    {
      value: 'Professional, Scientific & Technical Services',
      label: 'Professional, Scientific & Technical Services',
    },
    { value: 'Public Administration & Safety', label: 'Public Administration & Safety' },
    {
      value: 'Rental, Hiring & Real Estate Services',
      label: 'Rental, Hiring & Real Estate Services',
    },
    { value: 'Retail Trade', label: 'Retail Trade' },
    { value: 'Transport, Postal & Warehousing', label: 'Transport, Postal & Warehousing' },
    { value: 'Wholesale Trade', label: 'Wholesale Trade' },
    { value: 'Other Services', label: 'Other Services' },
  ];

  const [post, setPost] = useState<CommunityPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [moderationError, setModerationError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    category: '',
    currency: 'AUD',
    location: {
      lat: -38.1499,
      lng: 144.3617,
      address: '',
    },
    tags: '',
    visibility: 'public',
    // Job-specific fields
    startDate: '',
    jobType: 'full_time',
    industry: '',
    employerType: 'person',
    workType: 'onsite',
    // Event-specific fields
    eventDate: '',
    eventEndDate: '',
    eventType: 'other',
    capacity: '',
    // Request/Help-specific fields
    urgency: 'medium',
    deadline: '',
    budget: '',
    helpType: 'one_time',
    // Sale/Marketplace-specific fields
    condition: 'good',
    brand: '',
    deliveryAvailable: false,
    pickupOnly: false,
    // Offer-specific fields
    duration: '',
    termsConditions: '',
    availability: 'flexible',
    // Announcement-specific fields
    announcementType: 'info',
    importance: 'medium',
    expiryDate: '',
  });

  const categories = [
    { value: 'community', label: 'Community' },
    { value: 'events', label: 'Events' },
    { value: 'marketplace', label: 'Marketplace' },
    { value: 'free_items', label: 'Free Items' },
    { value: 'help_requests', label: 'Help Requests' },
    { value: 'deals', label: 'Deals & Offers' },
    { value: 'offers', label: 'Offers' },
    { value: 'food', label: 'Food & Dining' },
    { value: 'services', label: 'Services' },
    { value: 'jobs', label: 'Jobs' },
    { value: 'sales', label: 'Sales' },
    { value: 'announcements', label: 'Announcements' },
  ];

  const jobTypes = [
    { value: 'full_time', label: 'Full Time' },
    { value: 'part_time', label: 'Part Time' },
    { value: 'one_off', label: 'One-off Job' },
    { value: 'contract', label: 'Contract' },
    { value: 'volunteer', label: 'Volunteer' },
  ];

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin');
      return;
    }

    const fetchPost = async () => {
      try {
        const fetchedPost = await getPostById(postId);
        if (!fetchedPost) {
          router.push('/community');
          return;
        }

        // Check if user owns this post
        if (fetchedPost.authorId !== user.id) {
          router.push('/community');
          return;
        }

        setPost(fetchedPost);
        setExistingImages(fetchedPost.images || []);
        setFormData({
          title: fetchedPost.title,
          description: fetchedPost.description,
          category: fetchedPost.category,
          price: fetchedPost.price?.toString() || '',
          currency: fetchedPost.currency || 'AUD',
          location: fetchedPost.location || {
            lat: -38.1499,
            lng: 144.3617,
            address: '',
          },
          tags: fetchedPost.tags.join(', '),
          visibility: fetchedPost.visibility,
          // Job-specific fields
          startDate: fetchedPost.startDate
            ? new Date(fetchedPost.startDate).toISOString().split('T')[0]
            : '',
          jobType: fetchedPost.jobType || 'full_time',
          industry: fetchedPost.industry || '',
          employerType: fetchedPost.employerType || 'person',
          workType: fetchedPost.workType || 'onsite',
          // Event-specific fields
          eventDate: fetchedPost.eventDate
            ? new Date(fetchedPost.eventDate).toISOString().slice(0, 16)
            : '',
          eventEndDate: fetchedPost.eventEndDate
            ? new Date(fetchedPost.eventEndDate).toISOString().slice(0, 16)
            : '',
          eventType: fetchedPost.eventType || 'other',
          capacity: fetchedPost.capacity?.toString() || '',
          // Request/Help-specific fields
          urgency: fetchedPost.urgency || 'medium',
          deadline: fetchedPost.deadline
            ? new Date(fetchedPost.deadline).toISOString().split('T')[0]
            : '',
          budget: fetchedPost.budget?.toString() || '',
          helpType: fetchedPost.helpType || 'one_time',
          // Sale/Marketplace-specific fields
          condition: fetchedPost.condition || 'good',
          brand: fetchedPost.brand || '',
          deliveryAvailable: fetchedPost.deliveryAvailable || false,
          pickupOnly: fetchedPost.pickupOnly || false,
          // Offer-specific fields
          duration: fetchedPost.duration || '',
          termsConditions: fetchedPost.termsConditions || '',
          availability: fetchedPost.availability || 'flexible',
          // Announcement-specific fields
          announcementType: fetchedPost.announcementType || 'info',
          importance: fetchedPost.importance || 'medium',
          expiryDate: fetchedPost.expiryDate
            ? new Date(fetchedPost.expiryDate).toISOString().split('T')[0]
            : '',
        });
      } catch (error) {
        console.error('Error fetching post:', error);
        router.push('/community');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [user, postId, router]);

  const handleLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    setFormData(prev => ({ ...prev, location }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Validate each file
    const validFiles = files.filter(file => {
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        alert(validation.error);
        return false;
      }
      return true;
    });

    setSelectedImages(prev => [...prev, ...validFiles]);
  };

  const removeSelectedImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (imageUrl: string) => {
    setExistingImages(prev => prev.filter(url => url !== imageUrl));
    setImagesToDelete(prev => [...prev, imageUrl]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !post) return;

    setIsSubmitting(true);
    setModerationError(null);

    try {
      // Moderate content before submitting
      const contentToModerate = `${formData.title}\n\n${formData.description}`;
      const moderationResult = await moderateContent(contentToModerate);

      if (!moderationResult.safe) {
        setModerationError(moderationResult.message);
        return;
      }

      // Upload new images
      const uploadedImageUrls: string[] = [];
      for (const image of selectedImages) {
        try {
          const url = await uploadImage(image, `community/${postId}`, user.id);
          uploadedImageUrls.push(url);
        } catch (error) {
          console.error('Error uploading image:', error);
        }
      }

      // Delete removed images
      for (const imageUrl of imagesToDelete) {
        try {
          await deleteImage(imageUrl);
        } catch (error) {
          console.error('Error deleting image:', error);
        }
      }

      // Combine existing and new images
      const allImages = [...existingImages, ...uploadedImageUrls];

      // Update post data
      const updatedData = {
        title: formData.title,
        description: formData.description,
        category: formData.category as PostCategory,
        price:
          formData.price && !isNaN(parseFloat(formData.price))
            ? parseFloat(formData.price)
            : undefined,
        currency: formData.currency,
        location: formData.location,
        images: allImages,
        visibility: formData.visibility,
        tags: formData.tags
          .split(',')
          .map((tag: string) => tag.trim())
          .filter(Boolean),
        updatedAt: new Date(),
        // Job-specific fields (only include if category is jobs)
        ...(formData.category === 'jobs' && {
          startDate: formData.startDate ? new Date(formData.startDate) : undefined,
          jobType: formData.jobType,
          industry: formData.industry || undefined,
          employerType: formData.employerType,
          workType: formData.workType,
        }),
        // Event-specific fields
        ...(formData.category === 'events' && {
          eventDate: formData.eventDate ? new Date(formData.eventDate) : undefined,
          eventEndDate: formData.eventEndDate ? new Date(formData.eventEndDate) : undefined,
          eventType: formData.eventType,
          capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
        }),
        // Request/Help-specific fields
        ...(formData.category === 'help_requests' && {
          urgency: formData.urgency,
          deadline: formData.deadline ? new Date(formData.deadline) : undefined,
          budget: formData.budget ? parseFloat(formData.budget) : undefined,
          helpType: formData.helpType,
        }),
        // Sale/Marketplace-specific fields
        ...((formData.category === 'marketplace' ||
          formData.category === 'free_items' ||
          formData.category === 'sales') && {
          condition: formData.condition,
          brand: formData.brand,
          deliveryAvailable: formData.deliveryAvailable,
          pickupOnly: formData.pickupOnly,
        }),
        // Offer-specific fields
        ...((formData.category === 'deals' ||
          formData.category === 'services' ||
          formData.category === 'offers') && {
          duration: formData.duration,
          termsConditions: formData.termsConditions,
          availability: formData.availability,
        }),
        // Announcement-specific fields
        ...(formData.category === 'announcements' && {
          announcementType: formData.announcementType,
          importance: formData.importance,
          expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : undefined,
        }),
      };

      await updatePost(postId, updatedData);

      router.push(`/community/${postId}`);
    } catch (error) {
      console.error('Error updating post:', error);
      if (!moderationError) {
        setModerationError('Failed to update post. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-600">Loading post...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-sm sm:text-base text-gray-600">Post not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8 lg:py-12">
      <div className="max-w-2xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="bg-white rounded-lg shadow-sm sm:shadow px-4 py-6 sm:px-6 sm:py-8">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Edit Post</h1>
            <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
              Update your post with the Bellarine Peninsula community
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                required
                value={formData.title}
                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="What would you like to share?"
                onFocus={() => moderationError && setModerationError(null)}
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                id="category"
                required
                value={formData.category}
                onChange={e => {
                  const newCategory = e.target.value;
                  setFormData(prev => ({
                    ...prev,
                    category: newCategory,
                  }));
                }}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Price (for marketplace items) */}
            {(formData.category === 'marketplace' ||
              formData.category === 'deals' ||
              formData.category === 'sales' ||
              formData.category === 'offers' ||
              formData.category === 'events') && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                    Price {formData.category === 'events' ? '(optional)' : ''}
                  </label>
                  <input
                    type="number"
                    id="price"
                    step="0.01"
                    min="0"
                    value={formData.price || ''}
                    onChange={e => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label
                    htmlFor="currency"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Currency
                  </label>
                  <select
                    id="currency"
                    value={formData.currency}
                    onChange={e => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                    className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="AUD">AUD</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                required
                rows={4}
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                placeholder="Provide details about your post..."
                onFocus={() => moderationError && setModerationError(null)}
              />
            </div>

            {/* Job-specific fields */}
            {formData.category === 'jobs' && (
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-sm font-medium text-blue-900 mb-3">Job Details</h3>

                {/* Start Date */}
                <div>
                  <label
                    htmlFor="startDate"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    value={formData.startDate || ''}
                    onChange={e => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 bg-white text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Employer Type and Work Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="employerType"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Posted by
                    </label>
                    <select
                      id="employerType"
                      value={formData.employerType || 'person'}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          employerType: e.target.value as 'business' | 'person',
                        }))
                      }
                      className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 bg-white text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="person">Individual/Person</option>
                      <option value="business">Business</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="workType"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Work Type
                    </label>
                    <select
                      id="workType"
                      value={formData.workType || 'onsite'}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          workType: e.target.value as 'onsite' | 'remote' | 'hybrid',
                        }))
                      }
                      className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 bg-white text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="onsite">On-site</option>
                      <option value="remote">Remote</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>
                </div>

                {/* Job Type */}
                <div>
                  <label htmlFor="jobType" className="block text-sm font-medium text-gray-700 mb-2">
                    Job Type
                  </label>
                  <select
                    id="jobType"
                    value={formData.jobType || 'full_time'}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        jobType: e.target.value as JobType,
                      }))
                    }
                    className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 bg-white text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {JOB_TYPES.map(jobType => (
                      <option key={jobType.value} value={jobType.value}>
                        {jobType.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Industry */}
                <div>
                  <label
                    htmlFor="industry"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Industry
                  </label>
                  <select
                    id="industry"
                    value={formData.industry || ''}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        industry: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 bg-white text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {INDUSTRIES.map(industry => (
                      <option key={industry.value} value={industry.value}>
                        {industry.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <div className="space-y-3 sm:space-y-4">
                <AddressAutocomplete
                  type="locality"
                  value={formData.location.address}
                  onChange={(address: string, coordinates?: { lat: number; lng: number }) =>
                    setFormData(prev => ({
                      ...prev,
                      location: {
                        address,
                        lat: coordinates?.lat || prev.location.lat,
                        lng: coordinates?.lng || prev.location.lng,
                      },
                    }))
                  }
                  placeholder="Enter address"
                  className=""
                />
                <div className="h-48 sm:h-64 rounded-md border overflow-hidden">
                  <MapPicker
                    initialLocation={formData.location}
                    onLocationSelect={handleLocationSelect}
                  />
                </div>
              </div>
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>
              <div className="space-y-3 sm:space-y-4">
                {/* Existing Images */}
                {existingImages.length > 0 && (
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-2">Current images:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4">
                      {existingImages.map((imageUrl, index) => (
                        <div key={index} className="relative">
                          <Image
                            src={imageUrl}
                            alt={`Existing ${index + 1}`}
                            width={100}
                            height={96}
                            className="w-full h-20 sm:h-24 object-cover rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => removeExistingImage(imageUrl)}
                            className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          >
                            <XMarkIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Images */}
                {selectedImages.length > 0 && (
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-2">New images to add:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4">
                      {selectedImages.map((image, index) => (
                        <div key={index} className="relative">
                          <Image
                            src={URL.createObjectURL(image)}
                            alt={`New ${index + 1}`}
                            width={100}
                            height={96}
                            className="w-full h-20 sm:h-24 object-cover rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => removeSelectedImage(index)}
                            className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          >
                            <XMarkIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload Button */}
                <div className="flex justify-center px-4 py-4 sm:px-6 sm:pt-5 sm:pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <PhotoIcon className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
                    <div className="flex text-xs sm:text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                      >
                        <span>Upload images</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageChange}
                          className="sr-only"
                        />
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div>
              {/* Event-specific fields */}
              {formData.category === 'events' && (
                <div className="border border-gray-200 rounded-lg p-4 bg-blue-50">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Event Details</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="eventDate"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Event Date *
                        </label>
                        <input
                          type="datetime-local"
                          id="eventDate"
                          value={formData.eventDate || ''}
                          onChange={e =>
                            setFormData(prev => ({ ...prev, eventDate: e.target.value }))
                          }
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="eventEndDate"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          End Date
                        </label>
                        <input
                          type="datetime-local"
                          id="eventEndDate"
                          value={formData.eventEndDate || ''}
                          onChange={e =>
                            setFormData(prev => ({ ...prev, eventEndDate: e.target.value }))
                          }
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="eventType"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Event Type
                        </label>
                        <select
                          id="eventType"
                          value={formData.eventType || 'social'}
                          onChange={e =>
                            setFormData(prev => ({
                              ...prev,
                              eventType: e.target.value as
                                | 'workshop'
                                | 'meeting'
                                | 'festival'
                                | 'market'
                                | 'sport'
                                | 'social'
                                | 'other',
                            }))
                          }
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="social">Social</option>
                          <option value="workshop">Workshop</option>
                          <option value="meeting">Meeting</option>
                          <option value="festival">Festival</option>
                          <option value="market">Market</option>
                          <option value="sport">Sport</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label
                          htmlFor="capacity"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Capacity
                        </label>
                        <input
                          type="number"
                          id="capacity"
                          min="1"
                          value={formData.capacity || ''}
                          onChange={e =>
                            setFormData(prev => ({ ...prev, capacity: e.target.value }))
                          }
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Max attendees"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Request/Help-specific fields */}
              {formData.category === 'help_requests' && (
                <div className="border border-gray-200 rounded-lg p-4 bg-green-50">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Request Details</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="urgency"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Urgency
                        </label>
                        <select
                          id="urgency"
                          value={formData.urgency || 'medium'}
                          onChange={e =>
                            setFormData(prev => ({
                              ...prev,
                              urgency: e.target.value as 'low' | 'medium' | 'high',
                            }))
                          }
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="urgent">Urgent</option>
                        </select>
                      </div>
                      <div>
                        <label
                          htmlFor="helpType"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Help Type
                        </label>
                        <select
                          id="helpType"
                          value={formData.helpType || 'one_time'}
                          onChange={e =>
                            setFormData(prev => ({
                              ...prev,
                              helpType: e.target.value as 'one_time' | 'ongoing' | 'volunteer',
                            }))
                          }
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="one_time">One Time</option>
                          <option value="ongoing">Ongoing</option>
                          <option value="volunteer">Volunteer</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="deadline"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Deadline
                        </label>
                        <input
                          type="date"
                          id="deadline"
                          value={formData.deadline || ''}
                          onChange={e =>
                            setFormData(prev => ({ ...prev, deadline: e.target.value }))
                          }
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="budget"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Budget
                        </label>
                        <input
                          type="text"
                          id="budget"
                          value={formData.budget || ''}
                          onChange={e => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., $50-100, Free, To be discussed"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Sale/Marketplace-specific fields */}
              {(formData.category === 'marketplace' ||
                formData.category === 'free_items' ||
                formData.category === 'sales') && (
                <div className="border border-gray-200 rounded-lg p-4 bg-yellow-50">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Item Details</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="condition"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Condition
                        </label>
                        <select
                          id="condition"
                          value={formData.condition || 'good'}
                          onChange={e =>
                            setFormData(prev => ({
                              ...prev,
                              condition: e.target.value as
                                | 'new'
                                | 'like_new'
                                | 'good'
                                | 'fair'
                                | 'poor',
                            }))
                          }
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="new">New</option>
                          <option value="like_new">Like New</option>
                          <option value="good">Good</option>
                          <option value="fair">Fair</option>
                          <option value="poor">Poor</option>
                          <option value="for_parts">For Parts</option>
                        </select>
                      </div>
                      <div>
                        <label
                          htmlFor="brand"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Brand
                        </label>
                        <input
                          type="text"
                          id="brand"
                          value={formData.brand || ''}
                          onChange={e => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Item brand or manufacturer"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="deliveryAvailable"
                          checked={formData.deliveryAvailable || false}
                          onChange={e =>
                            setFormData(prev => ({ ...prev, deliveryAvailable: e.target.checked }))
                          }
                          className="mr-2"
                        />
                        <label htmlFor="deliveryAvailable" className="text-sm text-gray-700">
                          Delivery available
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="pickupOnly"
                          checked={formData.pickupOnly || false}
                          onChange={e =>
                            setFormData(prev => ({ ...prev, pickupOnly: e.target.checked }))
                          }
                          className="mr-2"
                        />
                        <label htmlFor="pickupOnly" className="text-sm text-gray-700">
                          Pickup only
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Offer-specific fields */}
              {(formData.category === 'deals' ||
                formData.category === 'services' ||
                formData.category === 'offers') && (
                <div className="border border-gray-200 rounded-lg p-4 bg-purple-50">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Offer Details</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="duration"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Offer Duration
                        </label>
                        <input
                          type="text"
                          id="duration"
                          value={formData.duration || ''}
                          onChange={e =>
                            setFormData(prev => ({ ...prev, duration: e.target.value }))
                          }
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., Until end of month, Limited time"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="availability"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Availability
                        </label>
                        <select
                          id="availability"
                          value={formData.availability || 'flexible'}
                          onChange={e =>
                            setFormData(prev => ({
                              ...prev,
                              availability: e.target.value as
                                | 'weekdays'
                                | 'weekends'
                                | 'flexible'
                                | 'by_appointment',
                            }))
                          }
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="weekdays">Weekdays</option>
                          <option value="weekends">Weekends</option>
                          <option value="flexible">Flexible</option>
                          <option value="by_appointment">By Appointment</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="termsConditions"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Terms & Conditions
                      </label>
                      <textarea
                        id="termsConditions"
                        rows={3}
                        value={formData.termsConditions || ''}
                        onChange={e =>
                          setFormData(prev => ({ ...prev, termsConditions: e.target.value }))
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Any specific terms, conditions, or restrictions..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Announcement-specific fields */}
              {formData.category === 'announcements' && (
                <div className="border border-gray-200 rounded-lg p-4 bg-red-50">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Announcement Details</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="announcementType"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Announcement Type
                        </label>
                        <select
                          id="announcementType"
                          value={formData.announcementType || 'info'}
                          onChange={e =>
                            setFormData(prev => ({
                              ...prev,
                              announcementType: e.target.value as
                                | 'info'
                                | 'warning'
                                | 'update'
                                | 'reminder',
                            }))
                          }
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="info">Information</option>
                          <option value="warning">Warning</option>
                          <option value="update">Update</option>
                          <option value="reminder">Reminder</option>
                        </select>
                      </div>
                      <div>
                        <label
                          htmlFor="importance"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Importance
                        </label>
                        <select
                          id="importance"
                          value={formData.importance || 'medium'}
                          onChange={e =>
                            setFormData(prev => ({
                              ...prev,
                              importance: e.target.value as 'low' | 'medium' | 'high',
                            }))
                          }
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="low">Low</option>
                          <option value="normal">Normal</option>
                          <option value="high">High</option>
                          <option value="critical">Critical</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="expiryDate"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Expiry Date
                      </label>
                      <input
                        type="date"
                        id="expiryDate"
                        value={formData.expiryDate || ''}
                        onChange={e =>
                          setFormData(prev => ({ ...prev, expiryDate: e.target.value }))
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        When this announcement should no longer be visible
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <input
                type="text"
                id="tags"
                value={formData.tags}
                onChange={e => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., vintage, furniture, urgent"
              />
              <p className="mt-1 text-xs sm:text-sm text-gray-500">
                Add tags to help people find your post (e.g., vintage, furniture, urgent)
              </p>
            </div>

            {/* Visibility */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Visibility</label>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-start sm:items-center">
                  <input
                    type="radio"
                    id="public"
                    name="visibility"
                    value="public"
                    checked={formData.visibility === 'public'}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        visibility: e.target.value as 'public' | 'verified_only',
                      }))
                    }
                    className="mt-0.5 sm:mt-0 mr-2 sm:mr-3"
                  />
                  <label
                    htmlFor="public"
                    className="text-xs sm:text-sm leading-tight sm:leading-normal"
                  >
                    Public - Visible to everyone
                  </label>
                </div>
                <div className="flex items-start sm:items-center">
                  <input
                    type="radio"
                    id="verified_only"
                    name="visibility"
                    value="verified_only"
                    checked={formData.visibility === 'verified_only'}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        visibility: e.target.value as 'public' | 'verified_only',
                      }))
                    }
                    className="mt-0.5 sm:mt-0 mr-2 sm:mr-3"
                  />
                  <label
                    htmlFor="verified_only"
                    className="text-xs sm:text-sm leading-tight sm:leading-normal"
                  >
                    Verified Only - Only visible to verified Bellarine residents
                  </label>
                </div>
              </div>
            </div>

            {/* Moderation error message */}
            {moderationError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">{moderationError}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-4 sm:pt-6">
              <button
                type="submit"
                disabled={isSubmitting || isModerating}
                className="w-full bg-blue-600 text-white py-3 sm:py-2 px-4 text-sm sm:text-base font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Updating Post...' : isModerating ? 'Checking...' : 'Update Post'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
