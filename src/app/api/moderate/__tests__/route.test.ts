// Mock OpenAI before importing anything else
jest.mock('openai', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    moderations: {
      create: jest.fn(),
    },
  })),
}));

// Mock Next.js server components
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, init?) => ({
      json: async () => data,
      status: init?.status || 200,
    })),
  },
}));

// Mock the moderation utility
jest.mock('@/lib/moderation');

import { POST } from '../route';
import { moderateContent, getFlaggedContentMessage } from '@/lib/moderation';
const mockModerateContent = moderateContent as jest.MockedFunction<typeof moderateContent>;
const mockGetFlaggedContentMessage = getFlaggedContentMessage as jest.MockedFunction<
  typeof getFlaggedContentMessage
>;

// Helper to create a mock NextRequest
function createMockRequest(body: any) {
  return {
    json: async () => body,
  } as any;
}

// Helper to create complete moderation result
function createModerationResult(flagged: boolean, overrides: any = {}) {
  return {
    flagged,
    categories: {
      sexual: false,
      hate: false,
      harassment: false,
      'self-harm': false,
      'sexual/minors': false,
      'hate/threatening': false,
      'violence/graphic': false,
      'self-harm/intent': false,
      'self-harm/instructions': false,
      'harassment/threatening': false,
      violence: false,
      ...overrides.categories,
    },
    category_scores: {
      sexual: 0.001,
      hate: 0.001,
      harassment: 0.001,
      'self-harm': 0.001,
      'sexual/minors': 0.001,
      'hate/threatening': 0.001,
      'violence/graphic': 0.001,
      'self-harm/intent': 0.001,
      'self-harm/instructions': 0.001,
      'harassment/threatening': 0.001,
      violence: 0.001,
      ...overrides.category_scores,
    },
  };
}

describe('/api/moderate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return safe: true for appropriate content', async () => {
    mockModerateContent.mockResolvedValueOnce(createModerationResult(false));

    const request = createMockRequest({ content: 'This is safe content' });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      flagged: false,
      safe: true,
      message: 'Content is appropriate',
      categories: expect.any(Object),
    });
    expect(mockModerateContent).toHaveBeenCalledWith('This is safe content');
  });

  it('should return safe: false for inappropriate content', async () => {
    mockModerateContent.mockResolvedValueOnce(
      createModerationResult(true, {
        categories: { hate: true },
        category_scores: { hate: 0.9 },
      })
    );
    mockGetFlaggedContentMessage.mockReturnValueOnce('Content contains hate speech');

    const request = createMockRequest({ content: 'Inappropriate content' });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      flagged: true,
      safe: false,
      message: 'Content contains hate speech',
      categories: expect.objectContaining({ hate: true }),
    });
    expect(mockModerateContent).toHaveBeenCalledWith('Inappropriate content');
    expect(mockGetFlaggedContentMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        flagged: true,
        categories: expect.objectContaining({ hate: true }),
      })
    );
  });

  it('should return 400 for missing content', async () => {
    const request = createMockRequest({});
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({
      error: 'Content is required and must be a string',
    });
    expect(mockModerateContent).not.toHaveBeenCalled();
  });

  it('should return 400 for empty content', async () => {
    const request = createMockRequest({ content: '' });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({
      error: 'Content is required and must be a string',
    });
    expect(mockModerateContent).not.toHaveBeenCalled();
  });

  it('should return 400 for non-string content', async () => {
    const request = createMockRequest({ content: 123 });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({
      error: 'Content is required and must be a string',
    });
    expect(mockModerateContent).not.toHaveBeenCalled();
  });

  it('should return 500 for moderation service errors', async () => {
    mockModerateContent.mockRejectedValueOnce(new Error('OpenAI API error'));

    const request = createMockRequest({ content: 'Test content' });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({
      error: 'Failed to moderate content',
      safe: true,
      message: 'Content moderation temporarily unavailable',
    });
    expect(mockModerateContent).toHaveBeenCalledWith('Test content');
  });

  it('should handle empty content validation error specifically', async () => {
    // Empty content is handled before calling moderateContent
    const request = createMockRequest({ content: '   ' });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({
      error: 'Content cannot be empty',
    });
    expect(mockModerateContent).not.toHaveBeenCalled();
  });

  it('should handle long content appropriately', async () => {
    const longContent = 'A'.repeat(1000);
    mockModerateContent.mockResolvedValueOnce(createModerationResult(false));

    const request = createMockRequest({ content: longContent });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.safe).toBe(true);
    expect(mockModerateContent).toHaveBeenCalledWith(longContent);
  });

  it('should handle content with special characters', async () => {
    const specialContent = 'Hello! @#$%^&*()_+ 🎉 emoji content';
    mockModerateContent.mockResolvedValueOnce(createModerationResult(false));

    const request = createMockRequest({ content: specialContent });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.safe).toBe(true);
    expect(data.message).toBe('Content is appropriate');
    expect(mockModerateContent).toHaveBeenCalledWith(specialContent);
  });
});
