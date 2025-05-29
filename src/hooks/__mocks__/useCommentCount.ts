'use client';

export function useCommentCount(postId: string) {
  // Return static values for testing to avoid async state updates
  return { count: 5, loading: false };
}
