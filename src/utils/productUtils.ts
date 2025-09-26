
import { Product } from '../types';

export const formatDate = (dateString: string | Date): string => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
};

// Helper function to normalize a URL to its core hostname
const normalizeHostname = (url: string): string => {
  if (!url) return '';
  // Strips protocol, 'www.' prefix, and any path. Converts to lowercase.
  return url.trim().toLowerCase().replace(/^(?:https?|ftp):\/\//, '').replace(/^(?:www\.)?/, '').split('/')[0];
};

export const filterProducts = (
  products: Product[],
  blacklistedKeywords: string[],
  blockedStores: string[]
): Product[] => {
  if (!products) return [];

  const normalizedBlockedStores = blockedStores.map(normalizeHostname);

  return products.filter(product => {
    // Check for blacklisted keywords in product title and description
    const hasBlacklistedKeyword = blacklistedKeywords.some(keyword =>
      product.title.toLowerCase().includes(keyword) ||
      product.description.toLowerCase().includes(keyword)
    );

    if (hasBlacklistedKeyword) {
      return false; // Exclude product if it contains a blacklisted keyword
    }

    // Check for blocked stores
    const normalizedStoreUrl = normalizeHostname(product.store_url);
    const isStoreBlocked = normalizedBlockedStores.includes(normalizedStoreUrl);

    if (isStoreBlocked) {
      return false; // Exclude product if its store is blocked
    }

    return true; // Include product if it passes all checks
  });
};
