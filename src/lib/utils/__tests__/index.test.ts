import {
  cn,
  formatDate,
  formatShortDate,
  formatDateTime,
  formatTimeAgo,
  truncateText,
  generateSlug,
  isValidEmail,
  debounce,
  extractMentions,
  formatFileSize,
} from '../index';

describe('Utility functions', () => {
  describe('cn (className utility)', () => {
    it('merges class names correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2');
    });

    it('handles conditional classes', () => {
      expect(cn('base', true && 'conditional', false && 'hidden')).toBe('base conditional');
    });

    it('merges Tailwind classes correctly', () => {
      expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
    });

    it('handles empty inputs', () => {
      expect(cn()).toBe('');
      expect(cn('', undefined, null)).toBe('');
    });
  });

  describe('formatDate', () => {
    it('formats Date object correctly', () => {
      const date = new Date('2025-05-29T10:30:00Z');
      const result = formatDate(date);
      expect(result).toMatch(/29 May 2025/);
    });

    it('formats date string correctly', () => {
      const result = formatDate('2025-05-29');
      expect(result).toMatch(/29 May 2025/);
    });

    it('formats timestamp correctly', () => {
      const timestamp = new Date('2025-05-29').getTime();
      const result = formatDate(timestamp);
      expect(result).toMatch(/29 May 2025/);
    });

    it('handles null and undefined', () => {
      expect(formatDate(null)).toBe('N/A');
      expect(formatDate(undefined)).toBe('N/A');
    });

    it('handles invalid date', () => {
      expect(formatDate('invalid-date')).toBe('N/A');
      expect(formatDate(NaN)).toBe('N/A');
    });

    it('handles empty string', () => {
      expect(formatDate('')).toBe('N/A');
    });
  });

  describe('formatShortDate', () => {
    it('formats Date object correctly', () => {
      const date = new Date('2025-05-29T10:30:00Z');
      const result = formatShortDate(date);
      expect(result).toMatch(/29\/05\/2025/);
    });

    it('handles null and undefined', () => {
      expect(formatShortDate(null)).toBe('N/A');
      expect(formatShortDate(undefined)).toBe('N/A');
    });

    it('handles invalid date', () => {
      expect(formatShortDate('invalid-date')).toBe('N/A');
    });
  });

  describe('formatDateTime', () => {
    it('formats Date object with time correctly', () => {
      const date = new Date('2025-05-29T10:30:00Z');
      const result = formatDateTime(date);
      expect(result).toContain('29 May 2025');
      expect(result).toContain('10:30');
    });

    it('handles null and undefined', () => {
      expect(formatDateTime(null)).toBe('N/A');
      expect(formatDateTime(undefined)).toBe('N/A');
    });

    it('handles invalid date', () => {
      expect(formatDateTime('invalid-date')).toBe('N/A');
    });
  });

  describe('formatTimeAgo', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-05-29T12:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('formats recent time correctly', () => {
      const fiveMinutesAgo = new Date('2025-05-29T11:55:00Z');
      expect(formatTimeAgo(fiveMinutesAgo)).toBe('5 minutes ago');
    });

    it('formats hours correctly', () => {
      const twoHoursAgo = new Date('2025-05-29T10:00:00Z');
      expect(formatTimeAgo(twoHoursAgo)).toBe('2 hours ago');
    });

    it('formats days correctly', () => {
      const threeDaysAgo = new Date('2025-05-26T12:00:00Z');
      expect(formatTimeAgo(threeDaysAgo)).toBe('3 days ago');
    });

    it('formats just now correctly', () => {
      const justNow = new Date('2025-05-29T11:59:30Z');
      expect(formatTimeAgo(justNow)).toBe('just now');
    });

    it('handles null and undefined', () => {
      expect(formatTimeAgo(null)).toBe('N/A');
      expect(formatTimeAgo(undefined)).toBe('N/A');
    });
  });

  describe('truncateText', () => {
    it('truncates long text correctly', () => {
      const longText = 'This is a very long text that should be truncated';
      expect(truncateText(longText, 20)).toBe('This is a very long...');
    });

    it('does not truncate short text', () => {
      const shortText = 'Short text';
      expect(truncateText(shortText, 20)).toBe('Short text');
    });

    it('handles empty string', () => {
      expect(truncateText('', 10)).toBe('');
    });

    it('handles null and undefined', () => {
      expect(truncateText(null as any, 10)).toBe('');
      expect(truncateText(undefined as any, 10)).toBe('');
    });

    it('uses specified length', () => {
      const text = 'A'.repeat(200);
      const result = truncateText(text, 100);
      expect(result.length).toBeLessThanOrEqual(103); // 100 + '...'
    });
  });

  describe('generateSlug', () => {
    it('generates slug from title correctly', () => {
      expect(generateSlug('Hello World!')).toBe('hello-world');
    });

    it('handles special characters', () => {
      expect(generateSlug('Hello, World & Universe!')).toBe('hello-world-universe');
    });

    it('handles multiple spaces', () => {
      expect(generateSlug('Hello    World')).toBe('hello-world');
    });

    it('handles empty string', () => {
      expect(generateSlug('')).toBe('');
    });

    it('handles numbers', () => {
      expect(generateSlug('Product 123 Version 2.0')).toBe('product-123-version-20');
    });
  });

  describe('isValidEmail', () => {
    it('validates correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('test+tag@example.org')).toBe(true);
    });

    it('rejects invalid email addresses', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });

    it('handles null and undefined', () => {
      expect(isValidEmail(null as any)).toBe(false);
      expect(isValidEmail(undefined as any)).toBe(false);
    });
  });

  describe('debounce', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('delays function execution', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn();
      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('cancels previous calls', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('passes arguments correctly', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('arg1', 'arg2');
      jest.advanceTimersByTime(100);

      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
    });
  });

  describe('extractMentions', () => {
    it('extracts @mentions from text', () => {
      const text = 'Hello @john and @jane, how are you?';
      expect(extractMentions(text)).toEqual(['john', 'jane']);
    });

    it('handles empty text', () => {
      expect(extractMentions('')).toEqual([]);
    });

    it('handles text without mentions', () => {
      expect(extractMentions('No mentions here')).toEqual([]);
    });

    it('handles duplicate mentions', () => {
      const text = 'Hello @john and @john again';
      expect(extractMentions(text)).toEqual(['john']);
    });

    it('handles mentions with underscores and numbers', () => {
      const text = 'Hello @user_123 and @test2';
      expect(extractMentions(text)).toEqual(['user_123', 'test2']);
    });
  });

  describe('formatFileSize', () => {
    it('formats bytes correctly', () => {
      expect(formatFileSize(500)).toBe('500 B');
      expect(formatFileSize(0)).toBe('0 B');
    });

    it('formats kilobytes correctly', () => {
      expect(formatFileSize(1024)).toBe('1.0 KB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
    });

    it('formats megabytes correctly', () => {
      expect(formatFileSize(1024 * 1024)).toBe('1.0 MB');
      expect(formatFileSize(1024 * 1024 * 2.5)).toBe('2.5 MB');
    });

    it('formats gigabytes correctly', () => {
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1.0 GB');
    });

    it('handles negative numbers', () => {
      expect(formatFileSize(-100)).toBe('0 B');
    });

    it('handles decimal inputs', () => {
      expect(formatFileSize(1024.7)).toBe('1.0 KB');
    });
  });

  describe('Edge cases and error handling', () => {
    it('handles various falsy values in formatDate', () => {
      expect(formatDate(0)).toBe('1 January 1970'); // Unix epoch
      expect(formatDate(false as any)).toBe('N/A');
    });

    it('handles very large numbers in formatFileSize', () => {
      const largeNumber = 1024 ** 4; // TB
      const result = formatFileSize(largeNumber);
      expect(result).toContain('TB');
    });

    it('handles Unicode characters in generateSlug', () => {
      expect(generateSlug('Café & Résumé')).toBe('caf-rsum');
    });

    it('handles extremely long text in truncateText', () => {
      const veryLongText = 'A'.repeat(10000);
      const result = truncateText(veryLongText, 50);
      expect(result.length).toBeLessThanOrEqual(53); // 50 + '...'
    });
  });
});
