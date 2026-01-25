import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Utils } from '../src/utils';

describe('Utils', () => {
  describe('slugify', () => {
    it('should convert text to lowercase', () => {
      expect(Utils.slugify('Hello World')).toBe('hello-world');
    });

    it('should replace spaces with hyphens', () => {
      expect(Utils.slugify('hello world test')).toBe('hello-world-test');
    });

    it('should replace & with -and-', () => {
      expect(Utils.slugify('this & that')).toBe('this-and-that');
    });

    it('should remove non-word characters', () => {
      expect(Utils.slugify('hello@#$world')).toBe('helloworld');
    });

    it('should replace multiple hyphens with single hyphen', () => {
      expect(Utils.slugify('hello---world')).toBe('hello-world');
    });

    it('should trim whitespace', () => {
      expect(Utils.slugify('  hello world  ')).toBe('hello-world');
    });

    it('should handle empty string', () => {
      expect(Utils.slugify('')).toBe('');
    });

    it('should handle null/undefined by converting to string', () => {
      expect(Utils.slugify(null as unknown as string)).toBe('');
      expect(Utils.slugify(undefined as unknown as string)).toBe('');
    });
  });
});
