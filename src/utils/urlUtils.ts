/**
 * Removes the trailing slash from a URL, if it exists.
 * @param url The URL to normalize.
 * @returns The normalized URL.
 */
export const normalizeUrl = (url: string | undefined): string => {
  if (!url) return '';
  return url.replace(/\/$/, '');
};
