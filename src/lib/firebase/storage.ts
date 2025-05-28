import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './config';

/**
 * Upload a single image to Firebase Storage
 */
export async function uploadImage(
  file: File,
  folder: string = 'posts',
  userId: string
): Promise<string> {
  try {
    // Create a unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop();
    const filename = `${timestamp}_${randomString}.${extension}`;

    // Create storage reference
    const storageRef = ref(storage, `${folder}/${userId}/${filename}`);

    // Upload file
    const snapshot = await uploadBytes(storageRef, file);

    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image');
  }
}

/**
 * Upload multiple images to Firebase Storage
 */
export async function uploadImages(
  files: File[],
  folder: string = 'posts',
  userId: string
): Promise<string[]> {
  try {
    const uploadPromises = files.map(file => uploadImage(file, folder, userId));
    const urls = await Promise.all(uploadPromises);
    return urls;
  } catch (error) {
    console.error('Error uploading images:', error);
    throw new Error('Failed to upload images');
  }
}

/**
 * Delete an image from Firebase Storage
 */
export async function deleteImage(imageUrl: string): Promise<void> {
  try {
    // Extract the path from the URL
    const baseUrl = 'https://firebasestorage.googleapis.com/v0/b/';
    const urlParts = imageUrl.split(baseUrl)[1];
    if (!urlParts) throw new Error('Invalid image URL');

    const [bucketAndPath] = urlParts.split('?');
    const [, ...pathParts] = bucketAndPath.split('/o/');
    const path = pathParts.join('/o/').replace(/%2F/g, '/');

    // Create storage reference
    const storageRef = ref(storage, path);

    // Delete the file
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
    // Don't throw here - image deletion failure shouldn't break other operations
  }
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { isValid: false, error: 'File must be an image' };
  }

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    return { isValid: false, error: 'Image must be less than 5MB' };
  }

  // Check file extension
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!allowedExtensions.includes(extension)) {
    return { isValid: false, error: 'Invalid file format. Use JPG, PNG, GIF, or WebP' };
  }

  return { isValid: true };
}

/**
 * Resize image before upload (client-side)
 */
export function resizeImage(
  file: File,
  maxWidth: number = 1200,
  maxHeight: number = 800,
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;

      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw and compress image
      ctx?.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        blob => {
          if (blob) {
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(resizedFile);
          } else {
            reject(new Error('Failed to resize image'));
          }
        },
        file.type,
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Get optimized image URL with resize parameters
 */
export function getOptimizedImageUrl(url: string, width?: number, height?: number): string {
  // For Firebase Storage, you can use their resize service
  // This is a simplified version - in production you might want to use
  // Firebase Extensions like Resize Images
  if (width || height) {
    const params = new URLSearchParams();
    if (width) params.append('w', width.toString());
    if (height) params.append('h', height.toString());

    // This would work with a service like Cloudinary or similar
    // For Firebase, you'd typically use their resize extension
    return url; // Return original URL for now
  }

  return url;
}
