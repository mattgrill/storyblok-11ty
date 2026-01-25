/**
 * Utility class for common operations
 */
export class Utils {
  /**
   * Convert text to URL-friendly slug
   * @param text - The text to slugify
   * @returns Slugified string
   */
  static slugify(text: string): string {
    return (text || '')
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/&/g, '-and-') // Replace & with 'and'
      .replace(/[^\w-]+/g, '') // Remove all non-word chars
      .replace(/-+/g, '-'); // Replace multiple - with single -
  }
}
