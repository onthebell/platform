'use client';

import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth';
import { createPost } from '@/lib/firebase/firestore';
import { uploadImages, validateImageFile, resizeImage } from '@/lib/firebase/storage';
import { CommunityPost, PostCategory, PostType } from '@/types';
import { MapIcon, PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';

function CreatePostForm() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'community' as PostCategory,
    type: 'announcement' as PostType,
    price: '',
    currency: 'AUD',
    location: {
      address: '',
      lat: 0,
      lng: 0,
    },
    tags: '',
    visibility: 'public' as 'public' | 'verified_only',
  });

  // Handle URL parameters for pre-filling form
  useEffect(() => {
    const category = searchParams.get('category') as PostCategory;
    const type = searchParams.get('type') as PostType;
    
    if (category || type) {
      setFormData(prev => ({
        ...prev,
        ...(category && { category }),
        ...(type && { type })
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
  ];

  const types: { value: PostType; label: string }[] = [
    { value: 'announcement', label: 'Announcement' },
    { value: 'event', label: 'Event' },
    { value: 'offer', label: 'Offer' },
    { value: 'request', label: 'Request' },
    { value: 'sale', label: 'For Sale' },
    { value: 'free', label: 'Free' },
    { value: 'help', label: 'Help Needed' },
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

    try {
      // Upload images to Firebase Storage
      let imageUrls: string[] = [];
      if (selectedImages.length > 0) {
        imageUrls = await uploadImages(selectedImages, 'posts', user.id);
      }

      const postData: Omit<CommunityPost, 'id' | 'createdAt' | 'updatedAt'> = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        type: formData.type,
        authorId: user.id,
        authorName: user.displayName || user.email || 'Anonymous',
        location: formData.location.address ? formData.location : undefined,
        images: imageUrls.length > 0 ? imageUrls : undefined,
        price: formData.price ? parseFloat(formData.price) : undefined,
        currency: formData.price ? formData.currency : undefined,
        status: 'active',
        visibility: formData.visibility,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      };

      const postId = await createPost(postData);
      
      // Redirect to the new post
      router.push(`/community/${postId}`);
      
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
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
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter a clear, descriptive title..."
              />
            </div>

            {/* Category and Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  id="category"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as PostCategory }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                  Type *
                </label>
                <select
                  id="type"
                  required
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as PostType }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {types.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
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
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Provide details about your post..."
              />
            </div>

            {/* Price (conditional) */}
            {(formData.category === 'marketplace' || formData.type === 'sale') && (
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
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    id="currency"
                    value={formData.currency}
                    onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <div className="relative">
                <input
                  type="text"
                  id="location"
                  value={formData.location.address}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    location: { ...prev.location, address: e.target.value }
                  }))}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter address or suburb..."
                />
                <MapIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Images (Max 5)
              </label>
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
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter tags separated by commas..."
              />
              <p className="mt-1 text-sm text-gray-500">
                Add tags to help people find your post (e.g., vintage, furniture, urgent)
              </p>
            </div>

            {/* Visibility */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Visibility
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="public"
                    checked={formData.visibility === 'public'}
                    onChange={(e) => setFormData(prev => ({ ...prev, visibility: e.target.value as 'public' }))}
                    className="mr-2"
                  />
                  <span className="text-sm">Public - Visible to everyone</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="verified_only"
                    checked={formData.visibility === 'verified_only'}
                    onChange={(e) => setFormData(prev => ({ ...prev, visibility: e.target.value as 'verified_only' }))}
                    className="mr-2"
                  />
                  <span className="text-sm">Verified Residents Only</span>
                </label>
              </div>
            </div>

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
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : 'Create Post'}
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
