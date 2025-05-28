'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth';
import { getPostById, updatePost } from '@/lib/firebase/firestore';
import { uploadImage, deleteImage, validateImageFile } from '@/lib/firebase/storage';
import { CommunityPost, PostCategory, PostType } from '@/types';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import dynamic from 'next/dynamic';

// Dynamically import MapPicker to avoid SSR issues
const MapPicker = dynamic(() => import('@/components/map/MapPicker'), { ssr: false });

interface FormData {
  title: string;
  description: string;
  category: string;
  type: string;
  price?: string;
  currency: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  tags: string;
  visibility: 'public' | 'verified_only';
}

export default function EditPostPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const postId = params.postId as string;

  const [post, setPost] = useState<CommunityPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    category: '',
    type: '',
    currency: 'AUD',
    location: {
      lat: -38.1499,
      lng: 144.3617,
      address: '',
    },
    tags: '',
    visibility: 'public',
  });

  const categories = [
    { value: 'community', label: 'Community' },
    { value: 'events', label: 'Events' },
    { value: 'marketplace', label: 'Marketplace' },
    { value: 'free_items', label: 'Free Items' },
    { value: 'help_requests', label: 'Help Requests' },
    { value: 'deals', label: 'Deals & Offers' },
    { value: 'food', label: 'Food & Dining' },
    { value: 'services', label: 'Services' },
  ];

  const getTypesForCategory = (category: string) => {
    switch (category) {
      case 'community':
        return [
          { value: 'discussion', label: 'Discussion' },
          { value: 'question', label: 'Question' },
          { value: 'announcement', label: 'Announcement' },
        ];
      case 'events':
        return [
          { value: 'event', label: 'Event' },
          { value: 'workshop', label: 'Workshop' },
          { value: 'meetup', label: 'Meetup' },
        ];
      case 'marketplace':
        return [
          { value: 'sale', label: 'For Sale' },
          { value: 'wanted', label: 'Wanted' },
          { value: 'service', label: 'Service Offered' },
        ];
      case 'free_items':
        return [
          { value: 'free', label: 'Free Item' },
          { value: 'swap', label: 'Item Swap' },
        ];
      case 'help_requests':
        return [
          { value: 'request', label: 'Help Request' },
          { value: 'recommendation', label: 'Recommendation' },
        ];
      case 'deals':
        return [
          { value: 'discount', label: 'Discount/Sale' },
          { value: 'promotion', label: 'Promotion' },
        ];
      case 'food':
        return [
          { value: 'restaurant', label: 'Restaurant/Cafe' },
          { value: 'recipe', label: 'Recipe Share' },
          { value: 'review', label: 'Food Review' },
        ];
      case 'services':
        return [
          { value: 'professional', label: 'Professional Service' },
          { value: 'handyman', label: 'Handyman/Trades' },
          { value: 'personal', label: 'Personal Service' },
        ];
      default:
        return [{ value: 'general', label: 'General' }];
    }
  };

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
          type: fetchedPost.type,
          price: fetchedPost.price?.toString() || '',
          currency: fetchedPost.currency || 'AUD',
          location: fetchedPost.location || {
            lat: -38.1499,
            lng: 144.3617,
            address: '',
          },
          tags: fetchedPost.tags.join(', '),
          visibility: fetchedPost.visibility,
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

    try {
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
        type: formData.type as PostType,
        price: formData.price ? parseFloat(formData.price) : undefined,
        currency: formData.currency,
        location: formData.location,
        images: allImages,
        visibility: formData.visibility,
        tags: formData.tags
          .split(',')
          .map((tag: string) => tag.trim())
          .filter(Boolean),
        updatedAt: new Date(),
      };

      await updatePost(postId, updatedData);

      alert('Post updated successfully!');
      router.push(`/community/${postId}`);
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Failed to update post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading post...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Post not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow px-6 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Edit Post</h1>
            <p className="mt-2 text-gray-600">
              Update your post with the Bellarine Peninsula community
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="What would you like to share?"
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
                  onChange={e => {
                    const newCategory = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      category: newCategory,
                      type: '', // Reset type when category changes
                    }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
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
                  onChange={e => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!formData.category}
                >
                  <option value="">Select a type</option>
                  {formData.category &&
                    getTypesForCategory(formData.category).map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Price (for marketplace items) */}
            {(formData.category === 'marketplace' ||
              formData.category === 'deals' ||
              formData.category === 'events') && (
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Provide details about your post..."
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <div className="space-y-4">
                <input
                  type="text"
                  value={formData.location.address}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      location: { ...prev.location, address: e.target.value },
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter address"
                />
                <div className="h-64 rounded-md border">
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
              <div className="space-y-4">
                {/* Existing Images */}
                {existingImages.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Current images:</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {existingImages.map((imageUrl, index) => (
                        <div key={index} className="relative">
                          <Image
                            src={imageUrl}
                            alt={`Existing ${index + 1}`}
                            width={100}
                            height={96}
                            className="w-full h-24 object-cover rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => removeExistingImage(imageUrl)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Images */}
                {selectedImages.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">New images to add:</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {selectedImages.map((image, index) => (
                        <div key={index} className="relative">
                          <Image
                            src={URL.createObjectURL(image)}
                            alt={`New ${index + 1}`}
                            width={100}
                            height={96}
                            className="w-full h-24 object-cover rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => removeSelectedImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload Button */}
                <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
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
                      </label>
                    </div>
                  </div>
                </div>
              </div>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., vintage, furniture, urgent"
              />
              <p className="mt-1 text-sm text-gray-500">
                Add tags to help people find your post (e.g., vintage, furniture, urgent)
              </p>
            </div>

            {/* Visibility */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Visibility</label>
              <div className="space-y-2">
                <div className="flex items-center">
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
                    className="mr-2"
                  />
                  <label htmlFor="public" className="text-sm">
                    Public - Visible to everyone
                  </label>
                </div>
                <div className="flex items-center">
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
                    className="mr-2"
                  />
                  <label htmlFor="verified_only" className="text-sm">
                    Verified Only - Only visible to verified Bellarine residents
                  </label>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Updating Post...' : 'Update Post'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
