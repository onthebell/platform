import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ModerationResult {
  flagged: boolean;
  categories: {
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
  category_scores: {
    sexual: number;
    hate: number;
    harassment: number;
    'self-harm': number;
    'sexual/minors': number;
    'hate/threatening': number;
    'violence/graphic': number;
    'self-harm/intent': number;
    'self-harm/instructions': number;
    'harassment/threatening': number;
    violence: number;
  };
}

/**
 * Moderates content using OpenAI's moderation API
 * @param content - The text content to moderate
 * @returns Promise<ModerationResult> - The moderation result
 */
export async function moderateContent(content: string): Promise<ModerationResult> {
  // Check for empty content first, before the try-catch
  if (!content.trim()) {
    throw new Error('Content cannot be empty');
  }

  try {
    const response = await openai.moderations.create({
      input: content,
    });

    const result = response.results[0];

    return {
      flagged: result.flagged,
      categories: result.categories,
      category_scores: result.category_scores,
    };
  } catch (error) {
    console.error('Error moderating content:', error);
    throw new Error('Failed to moderate content');
  }
}

/**
 * Checks if content violates community guidelines
 * @param content - The text content to check
 * @returns Promise<boolean> - True if content is safe, false if flagged
 */
export async function isContentSafe(content: string): Promise<boolean> {
  try {
    const result = await moderateContent(content);
    return !result.flagged;
  } catch (error) {
    console.error('Error checking content safety:', error);
    // In case of API failure, allow content through but log the error
    return true;
  }
}

/**
 * Gets a user-friendly message for flagged content
 * @param result - The moderation result
 * @returns string - A user-friendly message explaining why content was flagged
 */
export function getFlaggedContentMessage(result: ModerationResult): string {
  if (!result.flagged) {
    return '';
  }

  const flaggedCategories = Object.entries(result.categories)
    .filter(([_, flagged]) => flagged)
    .map(([category]) => category);

  if (flaggedCategories.length === 0) {
    return 'Your content may not meet our community guidelines. Please review and try again.';
  }

  // Provide specific guidance based on the flagged categories
  if (flaggedCategories.includes('hate') || flaggedCategories.includes('hate/threatening')) {
    return 'Your content contains language that may be considered hateful. Please ensure your message is respectful to all community members.';
  }

  if (
    flaggedCategories.includes('harassment') ||
    flaggedCategories.includes('harassment/threatening')
  ) {
    return 'Your content may be considered harassment. Please keep your message constructive and respectful.';
  }

  if (flaggedCategories.includes('violence') || flaggedCategories.includes('violence/graphic')) {
    return 'Your content contains references to violence. Please keep discussions peaceful and appropriate for all community members.';
  }

  if (flaggedCategories.includes('sexual') || flaggedCategories.includes('sexual/minors')) {
    return 'Your content contains inappropriate sexual content. Please keep discussions family-friendly.';
  }

  if (
    flaggedCategories.includes('self-harm') ||
    flaggedCategories.includes('self-harm/intent') ||
    flaggedCategories.includes('self-harm/instructions')
  ) {
    return 'Your content contains concerning references to self-harm. If you need support, please contact a mental health professional or crisis helpline.';
  }

  return "Your content may not meet our community guidelines. Please review and ensure it's appropriate for our community.";
}
