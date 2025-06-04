import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/firebase/auth';
import { saveJob, unsaveJob, isJobSaved, getSavedJobs } from '@/lib/firebase/firestore';
import { SavedPost, PostCategory } from '@/types';

/**
 * Custom hook for managing saved jobs functionality
 */
export function useSavedJobs() {
  const { user } = useAuth();
  const [savedJobs, setSavedJobs] = useState<SavedPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load saved jobs when user changes
  useEffect(() => {
    if (!user) {
      setSavedJobs([]);
      return;
    }

    const loadSavedJobs = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const jobs = await getSavedJobs(user.id);
        setSavedJobs(jobs as SavedPost[]);
      } catch (err) {
        console.error('Error loading saved jobs:', err);
        setError('Failed to load saved jobs');
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedJobs();
  }, [user]);

  /**
   * Save a job post
   */
  const saveJobPost = async (postId: string, postTitle: string, postCategory: PostCategory) => {
    if (!user) {
      setError('You must be signed in to save jobs');
      return false;
    }

    try {
      setError(null);
      await saveJob(user.id, postId, postTitle, postCategory);

      // Add to local state
      const newSavedJob: SavedPost = {
        id: '', // Will be set by Firestore
        userId: user.id,
        postId,
        postTitle,
        postCategory,
        savedAt: new Date(),
      };

      setSavedJobs(prev => [newSavedJob, ...prev]);
      return true;
    } catch (err: any) {
      console.error('Error saving job:', err);
      setError(err.message || 'Failed to save job');
      return false;
    }
  };

  /**
   * Unsave a job post
   */
  const unsaveJobPost = async (postId: string) => {
    if (!user) {
      setError('You must be signed in to unsave jobs');
      return false;
    }

    try {
      setError(null);
      await unsaveJob(user.id, postId);

      // Remove from local state
      setSavedJobs(prev => prev.filter(job => job.postId !== postId));
      return true;
    } catch (err: any) {
      console.error('Error unsaving job:', err);
      setError(err.message || 'Failed to unsave job');
      return false;
    }
  };

  /**
   * Check if a job is saved
   */
  const isJobSavedByUser = (postId: string): boolean => {
    return savedJobs.some(job => job.postId === postId);
  };

  /**
   * Toggle save status of a job
   */
  const toggleSaveJob = async (postId: string, postTitle: string, postCategory: PostCategory) => {
    if (isJobSavedByUser(postId)) {
      return await unsaveJobPost(postId);
    } else {
      return await saveJobPost(postId, postTitle, postCategory);
    }
  };

  return {
    savedJobs,
    isLoading,
    error,
    saveJobPost,
    unsaveJobPost,
    isJobSavedByUser,
    toggleSaveJob,
    canSaveJobs: !!user,
  };
}

/**
 * Hook for checking if a specific job is saved (lightweight version)
 */
export function useIsJobSaved(postId: string) {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user || !postId) {
      setIsSaved(false);
      return;
    }

    const checkSavedStatus = async () => {
      try {
        setIsLoading(true);
        const saved = await isJobSaved(user.id, postId);
        setIsSaved(saved);
      } catch (err) {
        console.error('Error checking saved status:', err);
        setIsSaved(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkSavedStatus();
  }, [user, postId]);

  return { isSaved, isLoading };
}
