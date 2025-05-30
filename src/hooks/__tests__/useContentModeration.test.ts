import { renderHook, waitFor, act } from '@testing-library/react';
import { useContentModeration, ModerationResult } from '../useContentModeration';

// Mock fetch globally
global.fetch = jest.fn();

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('useContentModeration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useContentModeration());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(typeof result.current.moderateContent).toBe('function');
  });

  it('should successfully moderate safe content', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ flagged: false, safe: true, message: 'Content is safe' }),
    } as Response);

    const { result } = renderHook(() => useContentModeration());

    let moderationResult: ModerationResult;

    await act(async () => {
      moderationResult = await result.current.moderateContent('This is safe content');
    });

    expect(moderationResult.safe).toBe(true);
    expect(moderationResult.flagged).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(mockFetch).toHaveBeenCalledWith('/api/moderate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'This is safe content' }),
    });
  });

  it('should handle inappropriate content', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        flagged: true,
        safe: false,
        message: 'Content contains inappropriate language',
      }),
    } as Response);

    const { result } = renderHook(() => useContentModeration());

    let moderationResult: ModerationResult;

    await act(async () => {
      moderationResult = await result.current.moderateContent('Inappropriate content');
    });

    expect(moderationResult.safe).toBe(false);
    expect(moderationResult.flagged).toBe(true);
    expect(moderationResult.message).toBe('Content contains inappropriate language');
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle API errors gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useContentModeration());

    let moderationResult: ModerationResult;

    await act(async () => {
      moderationResult = await result.current.moderateContent('Test content');
    });

    // Should allow content through when API fails
    expect(moderationResult.safe).toBe(true);
    expect(moderationResult.flagged).toBe(false);
    expect(moderationResult.message).toBe('Content moderation temporarily unavailable');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('Network error');
  });

  it('should handle HTTP error responses', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => ({ error: 'Server error' }),
    } as Response);

    const { result } = renderHook(() => useContentModeration());

    let moderationResult: ModerationResult;

    await act(async () => {
      moderationResult = await result.current.moderateContent('Test content');
    });

    // Should allow content through when API fails
    expect(moderationResult.safe).toBe(true);
    expect(moderationResult.flagged).toBe(false);
    expect(moderationResult.message).toBe('Content moderation temporarily unavailable');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('Server error');
  });

  it('should set isLoading to true during moderation', async () => {
    let resolvePromise: (value: any) => void;
    const mockPromise = new Promise(resolve => {
      resolvePromise = resolve;
    });

    mockFetch.mockReturnValueOnce(mockPromise as Promise<Response>);

    const { result } = renderHook(() => useContentModeration());

    // Start moderation but don't await it immediately
    const moderationPromise = result.current.moderateContent('Test content');

    // Check loading state immediately
    await waitFor(() => {
      expect(result.current.isLoading).toBe(true);
    });

    // Resolve the mock
    resolvePromise!({
      ok: true,
      json: async () => ({ flagged: false, safe: true, message: 'Content is safe' }),
    } as Response);

    // Wait for moderation to complete
    await act(async () => {
      await moderationPromise;
    });

    // Should no longer be loading
    expect(result.current.isLoading).toBe(false);
  });

  it('should clear error when starting new moderation', async () => {
    // First call - set an error
    mockFetch.mockRejectedValueOnce(new Error('First error'));

    const { result } = renderHook(() => useContentModeration());

    await act(async () => {
      await result.current.moderateContent('First content');
    });

    expect(result.current.error).toBe('First error');

    // Second call - should clear the error initially
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ flagged: false, safe: true, message: 'Content is safe' }),
    } as Response);

    await act(async () => {
      await result.current.moderateContent('Second content');
    });

    expect(result.current.error).toBe(null);
  });

  it('should handle empty content', async () => {
    const { result } = renderHook(() => useContentModeration());

    let moderationResult: ModerationResult;

    await act(async () => {
      moderationResult = await result.current.moderateContent('   ');
    });

    expect(moderationResult!.safe).toBe(true);
    expect(moderationResult!.flagged).toBe(false);
    expect(moderationResult!.message).toBe('Content moderation temporarily unavailable');
    expect(result.current.error).toBe('Content cannot be empty');
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('should handle malformed API responses', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        /* missing required fields */
      }),
    } as Response);

    const { result } = renderHook(() => useContentModeration());

    let moderationResult: ModerationResult;

    await act(async () => {
      moderationResult = await result.current.moderateContent('Test content');
    });

    // Should return the malformed response as-is
    expect(moderationResult!).toEqual({});
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });
});
