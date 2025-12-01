/**
 * Normalizes a URL by removing trailing slash, query parameters, and hash.
 * @param url The URL to normalize.
 * @returns The normalized URL.
 */
export const normalizeUrl = (url: string | undefined): string => {
  if (!url) return '';
  try {
      // If it's a full URL
      const urlObj = new URL(url);
      return `${urlObj.origin}${urlObj.pathname}`.replace(/\/$/, '');
  } catch (e) {
      // Fallback for relative or invalid URLs
      return url.split('?')[0].split('#')[0].replace(/\/$/, '');
  }
};
