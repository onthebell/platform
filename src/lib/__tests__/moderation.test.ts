import OpenAIModule from 'openai';
import { moderateContent, isContentSafe, getFlaggedContentMessage } from '@/lib/moderation';

const mockOpenAI = OpenAIModule as unknown as jest.Mock;

// Mock OpenAI
jest.mock('openai', () => {
  const mockModerationCreate = jest.fn();
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      moderations: {
        create: mockModerationCreate,
      },
    })),
  };
});

// Get the mock function reference
const mockModerationCreate = mockOpenAI().moderations.create;

describe('moderation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock environment variable
    process.env.OPENAI_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    delete process.env.OPENAI_API_KEY;
  });

  describe('moderateContent', () => {
    it('should return moderation result for safe content', async () => {
      const mockResponse = {
        results: [
          {
            flagged: false,
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
            },
            category_scores: {
              sexual: 0.1,
              hate: 0.05,
              harassment: 0.02,
              'self-harm': 0.01,
              'sexual/minors': 0.001,
              'hate/threatening': 0.001,
              'violence/graphic': 0.001,
              'self-harm/intent': 0.001,
              'self-harm/instructions': 0.001,
              'harassment/threatening': 0.001,
              violence: 0.02,
            },
          },
        ],
      };

      mockModerationCreate.mockResolvedValue(mockResponse);

      const result = await moderateContent('This is a safe message');

      expect(mockModerationCreate).toHaveBeenCalledWith({
        input: 'This is a safe message',
      });
      expect(result.flagged).toBe(false);
      expect(result.categories).toEqual(mockResponse.results[0].categories);
    });

    it('should return moderation result for flagged content', async () => {
      const mockResponse = {
        results: [
          {
            flagged: true,
            categories: {
              sexual: false,
              hate: true,
              harassment: false,
              'self-harm': false,
              'sexual/minors': false,
              'hate/threatening': false,
              'violence/graphic': false,
              'self-harm/intent': false,
              'self-harm/instructions': false,
              'harassment/threatening': false,
              violence: false,
            },
            category_scores: {
              sexual: 0.1,
              hate: 0.95,
              harassment: 0.02,
              'self-harm': 0.01,
              'sexual/minors': 0.001,
              'hate/threatening': 0.001,
              'violence/graphic': 0.001,
              'self-harm/intent': 0.001,
              'self-harm/instructions': 0.001,
              'harassment/threatening': 0.001,
              violence: 0.02,
            },
          },
        ],
      };

      mockModerationCreate.mockResolvedValue(mockResponse);

      const result = await moderateContent('This is hate speech');

      expect(result.flagged).toBe(true);
      expect(result.categories.hate).toBe(true);
    });

    it('should throw error for empty content', async () => {
      await expect(moderateContent('')).rejects.toThrow('Content cannot be empty');
      await expect(moderateContent('   ')).rejects.toThrow('Content cannot be empty');
    });

    it('should handle API errors', async () => {
      mockModerationCreate.mockRejectedValue(new Error('API Error'));

      await expect(moderateContent('Test content')).rejects.toThrow('Failed to moderate content');
    });
  });

  describe('isContentSafe', () => {
    it('should return true for safe content', async () => {
      const mockResponse = {
        results: [
          {
            flagged: false,
            categories: {},
            category_scores: {},
          },
        ],
      };

      mockModerationCreate.mockResolvedValue(mockResponse);

      const result = await isContentSafe('Safe content');
      expect(result).toBe(true);
    });

    it('should return false for flagged content', async () => {
      const mockResponse = {
        results: [
          {
            flagged: true,
            categories: { hate: true },
            category_scores: { hate: 0.95 },
          },
        ],
      };

      mockModerationCreate.mockResolvedValue(mockResponse);

      const result = await isContentSafe('Hateful content');
      expect(result).toBe(false);
    });

    it('should return true on API failure', async () => {
      mockModerationCreate.mockRejectedValue(new Error('API Error'));

      const result = await isContentSafe('Test content');
      expect(result).toBe(true); // Fails open
    });
  });

  describe('getFlaggedContentMessage', () => {
    it('should return empty string for safe content', () => {
      const result = {
        flagged: false,
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
        },
        category_scores: {} as any,
      };

      expect(getFlaggedContentMessage(result)).toBe('');
    });

    it('should return hate message for hate speech', () => {
      const result = {
        flagged: true,
        categories: {
          sexual: false,
          hate: true,
          harassment: false,
          'self-harm': false,
          'sexual/minors': false,
          'hate/threatening': false,
          'violence/graphic': false,
          'self-harm/intent': false,
          'self-harm/instructions': false,
          'harassment/threatening': false,
          violence: false,
        },
        category_scores: {} as any,
      };

      const message = getFlaggedContentMessage(result);
      expect(message).toContain('hateful');
      expect(message).toContain('respectful');
    });

    it('should return harassment message for harassment', () => {
      const result = {
        flagged: true,
        categories: {
          sexual: false,
          hate: false,
          harassment: true,
          'self-harm': false,
          'sexual/minors': false,
          'hate/threatening': false,
          'violence/graphic': false,
          'self-harm/intent': false,
          'self-harm/instructions': false,
          'harassment/threatening': false,
          violence: false,
        },
        category_scores: {} as any,
      };

      const message = getFlaggedContentMessage(result);
      expect(message).toContain('harassment');
      expect(message).toContain('constructive');
    });

    it('should return violence message for violence', () => {
      const result = {
        flagged: true,
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
          violence: true,
        },
        category_scores: {} as any,
      };

      const message = getFlaggedContentMessage(result);
      expect(message).toContain('violence');
      expect(message).toContain('peaceful');
    });

    it('should return sexual content message', () => {
      const result = {
        flagged: true,
        categories: {
          sexual: true,
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
        },
        category_scores: {} as any,
      };

      const message = getFlaggedContentMessage(result);
      expect(message).toContain('sexual content');
      expect(message).toContain('family-friendly');
    });

    it('should return self-harm message', () => {
      const result = {
        flagged: true,
        categories: {
          sexual: false,
          hate: false,
          harassment: false,
          'self-harm': true,
          'sexual/minors': false,
          'hate/threatening': false,
          'violence/graphic': false,
          'self-harm/intent': false,
          'self-harm/instructions': false,
          'harassment/threatening': false,
          violence: false,
        },
        category_scores: {} as any,
      };

      const message = getFlaggedContentMessage(result);
      expect(message).toContain('self-harm');
      expect(message).toContain('mental health');
    });

    it('should return general message for unknown categories', () => {
      const result = {
        flagged: true,
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
        },
        category_scores: {} as any,
      };

      const message = getFlaggedContentMessage(result);
      expect(message).toContain('community guidelines');
    });
  });
});
