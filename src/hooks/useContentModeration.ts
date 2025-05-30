import { useState, useCallback } from 'react';

export interface ModerationResult {
  flagged: boolean;
  safe: boolean;
  message: string;
  categories?: {
    sexual: boolean;
    hate: boolean;
    harassment: boolean;
    'self-harm': boolean;
    'sexual/minors': boolean;
    'hate/threatening': boolean;
    'violence/graphic': boolean;
    'self-harm/intent': boolean;
    'self-harm/instructions': boolean;
    'harassment/threatening': boolean;
    violence: boolean;
  };
}

export interface UseContentModerationReturn {
  moderateContent: (content: string) => Promise<ModerationResult>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Custom hook for content moderation using OpenAI's moderation API
 * @returns UseContentModerationReturn - Hook return values
 */
export function useContentModeration(): UseContentModerationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const moderateContent = useCallback(async (content: string): Promise<ModerationResult> => {
    setIsLoading(true);
    setError(null);

    try {
      if (!content.trim()) {
        throw new Error('Content cannot be empty');
      }

      const response = await fetch('/api/moderate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to moderate content');
      }

      const result = await response.json();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);

      // Return a safe result in case of error to allow content through
      return {
        flagged: false,
        safe: true,
        message: 'Content moderation temporarily unavailable',
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    moderateContent,
    isLoading,
    error,
  };
}
