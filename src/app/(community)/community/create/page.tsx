'use client';

import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth';
import { createPost } from '@/lib/firebase/firestore';
import { uploadImages, validateImageFile, resizeImage } from '@/lib/firebase/storage';
import { useContentModeration } from '@/hooks/useContentModeration';
import { CommunityPost, PostCategory, JobType } from '@/types';
import AddressAutocomplete from '@/components/ui/AddressAutocomplete';
import { MapIcon, PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';

function CreatePostForm() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { moderateContent, isLoading: isModerating } = useContentModeration();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [moderationError, setModerationError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'community' as PostCategory,
    price: '',
    currency: 'AUD',
    location: {
      address: '',
      lat: 0,
      lng: 0,
    },
    tags: '',
    visibility: 'public' as 'public' | 'verified_only',
    // Job-specific fields
    startDate: '',
    jobType: 'full_time' as JobType,
    industry: '',
    employerType: 'person' as 'business' | 'person',
    workType: 'onsite' as 'onsite' | 'remote' | 'hybrid',
    // Event-specific fields
    eventDate: '',
    eventEndDate: '',
    eventType: 'other' as
      | 'workshop'
      | 'meeting'
      | 'festival'
      | 'market'
      | 'sport'
      | 'social'
      | 'other',
    capacity: '',
    // Request/Help-specific fields
    urgency: 'medium' as 'low' | 'medium' | 'high',
    deadline: '',
    budget: '',
    helpType: 'one_time' as 'one_time' | 'ongoing' | 'volunteer',
    // Sale/Marketplace-specific fields
    condition: 'good' as 'new' | 'like_new' | 'good' | 'fair' | 'poor',
    brand: '',
    deliveryAvailable: false,
    pickupOnly: false,
    // Offer-specific fields
    duration: '',
    termsConditions: '',
    availability: 'flexible' as 'weekdays' | 'weekends' | 'flexible' | 'by_appointment',
    // Announcement-specific fields
    announcementType: 'info' as 'info' | 'warning' | 'update' | 'reminder',
    importance: 'medium' as 'low' | 'medium' | 'high',
    expiryDate: '',
  });

  // Handle URL parameters for pre-filling form
  useEffect(() => {
    const category = searchParams.get('category') as PostCategory;

    if (category) {
      setFormData(prev => ({
        ...prev,
        category,
      }));
    }
  }, [searchParams]);

  const categories: { value: PostCategory; label: string }[] = [
    { value: 'community', label: 'Community' },
    { value: 'events', label: 'Events' },
    { value: 'marketplace', label: 'Marketplace' },
    { value: 'free_items', label: 'Free Items' },
    { value: 'help_requests', label: 'Help Requests' },
    { value: 'deals', label: 'Deals & Offers' },
    { value: 'food', label: 'Food & Dining' },
    { value: 'services', label: 'Services' },
    { value: 'jobs', label: 'Jobs' },
    { value: 'offers', label: 'Offers' },
    { value: 'announcements', label: 'Announcements' },
    { value: 'sales', label: 'Sales' },
  ];

  const jobTypes: { value: JobType; label: string }[] = [
    { value: 'full_time', label: 'Full Time' },
    { value: 'part_time', label: 'Part Time' },
    { value: 'one_off', label: 'One-off Job' },
    { value: 'contract', label: 'Contract' },
    { value: 'volunteer', label: 'Volunteer' },
  ];

  const industries: { value: string; label: string }[] = [
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

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles: File[] = [];

    for (const file of files) {
      const validation = validateImageFile(file);
      if (validation.isValid) {
        try {
          // Resize image before adding to selection
          const resizedFile = await resizeImage(file);
          validFiles.push(resizedFile);
        } catch (error) {
          console.error('Error resizing image:', error);
          // Fall back to original file if resize fails
          validFiles.push(file);
        }
      } else {
        alert(`${file.name}: ${validation.error}`);
      }
    }

    setSelectedImages(prev => [...prev, ...validFiles].slice(0, 5)); // Max 5 images
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('You must be signed in to create a post');
      return;
    }

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

      // Upload images to Firebase Storage
      let imageUrls: string[] = [];
      if (selectedImages.length > 0) {
        imageUrls = await uploadImages(selectedImages, 'posts', user.id);
      }

      const postData: Omit<CommunityPost, 'id' | 'createdAt' | 'updatedAt'> = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        authorId: user.id,
        authorName: user.displayName || user.email || 'Anonymous',
        location: formData.location.address ? formData.location : undefined,
        images: imageUrls.length > 0 ? imageUrls : undefined,
        price:
          formData.price && !isNaN(parseFloat(formData.price))
            ? parseFloat(formData.price)
            : undefined,
        currency:
          formData.price && !isNaN(parseFloat(formData.price)) ? formData.currency : undefined,
        status: 'active',
        visibility: formData.visibility,
        tags: formData.tags
          .split(',')
          .map(tag => tag.trim())
          .filter(Boolean),
        // Job-specific fields (only include if category is jobs)
        ...(formData.category === 'jobs' && {
          startDate: formData.startDate ? new Date(formData.startDate) : undefined,
          jobType: formData.jobType,
          industry: formData.industry || undefined,
          employerType: formData.employerType,
          workType: formData.workType,
        }),
        // Event-specific fields (only include if category is events)
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
        ...((formData.category === 'sales' || formData.category === 'marketplace') && {
          condition: formData.condition,
          brand: formData.brand || undefined,
          deliveryAvailable: formData.deliveryAvailable,
          pickupOnly: formData.pickupOnly,
        }),
        // Offer-specific fields
        ...(formData.category === 'offers' && {
          duration: formData.duration || undefined,
          termsConditions: formData.termsConditions || undefined,
          availability: formData.availability,
        }),
        // Announcement-specific fields
        ...(formData.category === 'announcements' && {
          announcementType: formData.announcementType,
          importance: formData.importance,
          expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : undefined,
        }),
      };

      const postId = await createPost(postData);

      // Redirect to the new post
      router.push(`/community/${postId}`);
    } catch (error) {
      console.error('Error creating post:', error);
      if (!moderationError) {
        setModerationError('Failed to create post. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h2>
          <p className="text-gray-600 mb-6">You need to be signed in to create a post.</p>
          <button
            onClick={() => router.push('/auth/signin')}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Create New Post</h1>
            <p className="mt-2 text-gray-600">
              Share something with the Bellarine Peninsula community
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
                className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter a clear, descriptive title..."
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
                onChange={e =>
                  setFormData(prev => ({ ...prev, category: e.target.value as PostCategory }))
                }
                className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

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
                className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Provide details about your post..."
                onFocus={() => moderationError && setModerationError(null)}
              />
            </div>

            {/* Price (conditional) */}
            {(formData.category === 'marketplace' || formData.category === 'sales') && (
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                    Price
                  </label>
                  <input
                    type="number"
                    id="price"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={e => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="AUD">AUD</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>
            )}

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <AddressAutocomplete
                type="locality"
                value={formData.location.address}
                onChange={(address: string, coordinates?: { lat: number; lng: number }) =>
                  setFormData(prev => ({
                    ...prev,
                    location: {
                      address,
                      lat: coordinates?.lat || 0,
                      lng: coordinates?.lng || 0,
                    },
                  }))
                }
                placeholder="Enter address or suburb..."
                className=""
              />
            </div>

            {/* Job-specific fields */}
            {formData.category === 'jobs' && (
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-sm font-medium text-blue-900 mb-3">Job Details</h3>

                {/* Job Type */}
                <div>
                  <label htmlFor="jobType" className="block text-sm font-medium text-gray-700 mb-2">
                    Job Type
                  </label>
                  <select
                    id="jobType"
                    value={formData.jobType}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        jobType: e.target.value as JobType,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {jobTypes.map(jobType => (
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
                    value={formData.industry}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        industry: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {industries.map(industry => (
                      <option key={industry.value} value={industry.value}>
                        {industry.label}
                      </option>
                    ))}
                  </select>
                </div>

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
                    value={formData.startDate}
                    onChange={e => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Employer Type and Work Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="employerType"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Posted by
                    </label>
                    <select
                      id="employerType"
                      value={formData.employerType}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          employerType: e.target.value as 'business' | 'person',
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      value={formData.workType}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          workType: e.target.value as 'onsite' | 'remote' | 'hybrid',
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="onsite">On-site</option>
                      <option value="remote">Remote</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Event-specific fields */}
            {formData.category === 'events' && (
              <div className="space-y-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h3 className="text-sm font-medium text-purple-900 mb-3">Event Details</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Event Date */}
                  <div>
                    <label
                      htmlFor="eventDate"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Event Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      id="eventDate"
                      value={formData.eventDate}
                      onChange={e => setFormData(prev => ({ ...prev, eventDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Event End Date */}
                  <div>
                    <label
                      htmlFor="eventEndDate"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      End Date (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      id="eventEndDate"
                      value={formData.eventEndDate}
                      onChange={e =>
                        setFormData(prev => ({ ...prev, eventEndDate: e.target.value }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Event Type */}
                  <div>
                    <label
                      htmlFor="eventType"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Event Type
                    </label>
                    <select
                      id="eventType"
                      value={formData.eventType}
                      onChange={e =>
                        setFormData(prev => ({ ...prev, eventType: e.target.value as any }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="workshop">Workshop</option>
                      <option value="meeting">Meeting</option>
                      <option value="festival">Festival</option>
                      <option value="market">Market</option>
                      <option value="sport">Sport</option>
                      <option value="social">Social</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Capacity */}
                  <div>
                    <label
                      htmlFor="capacity"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Max Attendees (Optional)
                    </label>
                    <input
                      type="number"
                      id="capacity"
                      min="1"
                      value={formData.capacity}
                      onChange={e => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter maximum capacity"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Request/Help-specific fields */}
            {formData.category === 'help_requests' && (
              <div className="space-y-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h3 className="text-sm font-medium text-yellow-900 mb-3">Request Details</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Urgency */}
                  <div>
                    <label
                      htmlFor="urgency"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Urgency Level
                    </label>
                    <select
                      id="urgency"
                      value={formData.urgency}
                      onChange={e =>
                        setFormData(prev => ({ ...prev, urgency: e.target.value as any }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Low - No rush</option>
                      <option value="medium">Medium - Within a week</option>
                      <option value="high">High - ASAP</option>
                    </select>
                  </div>

                  {/* Help Type */}
                  <div>
                    <label
                      htmlFor="helpType"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Help Type
                    </label>
                    <select
                      id="helpType"
                      value={formData.helpType}
                      onChange={e =>
                        setFormData(prev => ({ ...prev, helpType: e.target.value as any }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="one_time">One-time help</option>
                      <option value="ongoing">Ongoing assistance</option>
                      <option value="volunteer">Volunteer opportunity</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Deadline */}
                  <div>
                    <label
                      htmlFor="deadline"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Needed By (Optional)
                    </label>
                    <input
                      type="date"
                      id="deadline"
                      value={formData.deadline}
                      onChange={e => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Budget */}
                  <div>
                    <label
                      htmlFor="budget"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Budget Available (Optional)
                    </label>
                    <input
                      type="number"
                      id="budget"
                      min="0"
                      step="0.01"
                      value={formData.budget}
                      onChange={e => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Sale/Marketplace-specific fields */}
            {(formData.category === 'sales' || formData.category === 'marketplace') && (
              <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="text-sm font-medium text-green-900 mb-3">Item Details</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Condition */}
                  <div>
                    <label
                      htmlFor="condition"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Condition
                    </label>
                    <select
                      id="condition"
                      value={formData.condition}
                      onChange={e =>
                        setFormData(prev => ({ ...prev, condition: e.target.value as any }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="new">New</option>
                      <option value="like_new">Like New</option>
                      <option value="good">Good</option>
                      <option value="fair">Fair</option>
                      <option value="poor">Poor</option>
                    </select>
                  </div>

                  {/* Brand */}
                  <div>
                    <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-2">
                      Brand (Optional)
                    </label>
                    <input
                      type="text"
                      id="brand"
                      value={formData.brand}
                      onChange={e => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter brand name"
                    />
                  </div>
                </div>

                {/* Delivery Options */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Delivery Options
                  </label>
                  <div className="flex flex-col space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.deliveryAvailable}
                        onChange={e =>
                          setFormData(prev => ({ ...prev, deliveryAvailable: e.target.checked }))
                        }
                        className="mr-2"
                      />
                      <span className="text-sm">Delivery available</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.pickupOnly}
                        onChange={e =>
                          setFormData(prev => ({ ...prev, pickupOnly: e.target.checked }))
                        }
                        className="mr-2"
                      />
                      <span className="text-sm">Pickup only</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Offer-specific fields */}
            {formData.category === 'offers' && (
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-sm font-medium text-blue-900 mb-3">Offer Details</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Duration */}
                  <div>
                    <label
                      htmlFor="duration"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Valid Duration
                    </label>
                    <input
                      type="text"
                      id="duration"
                      value={formData.duration}
                      onChange={e => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Until end of month, 2 weeks"
                    />
                  </div>

                  {/* Availability */}
                  <div>
                    <label
                      htmlFor="availability"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Availability
                    </label>
                    <select
                      id="availability"
                      value={formData.availability}
                      onChange={e =>
                        setFormData(prev => ({ ...prev, availability: e.target.value as any }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="flexible">Flexible</option>
                      <option value="weekdays">Weekdays only</option>
                      <option value="weekends">Weekends only</option>
                      <option value="by_appointment">By appointment</option>
                    </select>
                  </div>
                </div>

                {/* Terms & Conditions */}
                <div>
                  <label
                    htmlFor="termsConditions"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Terms & Conditions (Optional)
                  </label>
                  <textarea
                    id="termsConditions"
                    rows={3}
                    value={formData.termsConditions}
                    onChange={e =>
                      setFormData(prev => ({ ...prev, termsConditions: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Any terms or conditions for this offer..."
                  />
                </div>
              </div>
            )}

            {/* Announcement-specific fields */}
            {formData.category === 'announcements' && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Announcement Details</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Announcement Type */}
                  <div>
                    <label
                      htmlFor="announcementType"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Type
                    </label>
                    <select
                      id="announcementType"
                      value={formData.announcementType}
                      onChange={e =>
                        setFormData(prev => ({ ...prev, announcementType: e.target.value as any }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="info">Information</option>
                      <option value="warning">Warning</option>
                      <option value="update">Update</option>
                      <option value="reminder">Reminder</option>
                    </select>
                  </div>

                  {/* Importance */}
                  <div>
                    <label
                      htmlFor="importance"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Importance
                    </label>
                    <select
                      id="importance"
                      value={formData.importance}
                      onChange={e =>
                        setFormData(prev => ({ ...prev, importance: e.target.value as any }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  {/* Expiry Date */}
                  <div>
                    <label
                      htmlFor="expiryDate"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Expires On (Optional)
                    </label>
                    <input
                      type="date"
                      id="expiryDate"
                      value={formData.expiryDate}
                      onChange={e => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Images (Max 5)</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label htmlFor="images" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        Upload images
                      </span>
                      <input
                        id="images"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        className="sr-only"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Image Preview */}
              {selectedImages.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                  {selectedImages.map((file, index) => (
                    <div key={index} className="relative">
                      <Image
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        width={200}
                        height={96}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <input
                type="text"
                id="tags"
                value={formData.tags}
                onChange={e => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter tags separated by commas..."
              />
              <p className="mt-1 text-sm text-gray-500">
                Add tags to help people find your post (e.g., vintage, furniture, urgent)
              </p>
            </div>

            {/* Visibility */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Visibility</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="public"
                    checked={formData.visibility === 'public'}
                    onChange={e =>
                      setFormData(prev => ({ ...prev, visibility: e.target.value as 'public' }))
                    }
                    className="mr-2"
                  />
                  <span className="text-sm">Public - Visible to everyone</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="verified_only"
                    checked={formData.visibility === 'verified_only'}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        visibility: e.target.value as 'verified_only',
                      }))
                    }
                    className="mr-2"
                  />
                  <span className="text-sm">Verified Residents Only</span>
                </label>
              </div>
            </div>

            {/* Moderation error message */}
            {moderationError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">{moderationError}</p>
              </div>
            )}

            {/* Submit Buttons */}
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
                disabled={isSubmitting || isModerating}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : isModerating ? 'Checking...' : 'Create Post'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Loading fallback component
function CreatePostLoading() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function CreatePostPage() {
  return (
    <Suspense fallback={<CreatePostLoading />}>
      <CreatePostForm />
    </Suspense>
  );
}
