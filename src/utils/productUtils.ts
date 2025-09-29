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
export const normalizeHostname = (url: string): string => {
  if (!url) return '';
  // Strips protocol, 'www.' prefix, and any path. Converts to lowercase.
  return url.trim().toLowerCase().replace(/^(?:https?|ftp):\/\//, '').replace(/^(?:www\.)?/, '').split('/')[0];
};

/**
 * A more robust search function that normalizes text for better matching.
 * It handles different character cases and accents.
 */
const normalizeText = (text: string): string => {
    return text
        .toLowerCase()
        // NFD: Normalization Form Canonical Decomposition.
        // This separates combined characters into their base characters and diacritical marks.
        // For example, 'é' becomes 'e' + '´'.
        .normalize('NFD')
        // This regex removes the separated diacritical marks (accents, etc.).
        .replace(/[\\u0300-\\u036f]/g, '');
};

export const searchProducts = (
    products: Product[],
    searchTerm: string
): Product[] => {
    if (!searchTerm) {
        return products;
    }

    const normalizedSearchTerm = normalizeText(searchTerm);

    return products.filter(product => {
        const normalizedName = normalizeText(product.name || '');
        const normalizedDescription = normalizeText(product.description || '');
        
        return normalizedName.includes(normalizedSearchTerm) ||
               normalizedDescription.includes(normalizedSearchTerm);
    });
};


export const filterProducts = (
  products: Product[],
  blacklistedKeywords: string[],
  blockedStores: string[]
): Product[] => {
  const safeProducts = products || [];

  const hasKeywords = blacklistedKeywords && blacklistedKeywords.length > 0;
  const hasStores = blockedStores && blockedStores.length > 0;

  if (!hasKeywords && !hasStores) {
    return safeProducts;
  }

  const lowercasedKeywords = hasKeywords
    ? blacklistedKeywords.map(k => k.toLowerCase().trim()).filter(Boolean)
    : [];
  
  const normalizedBlockedStores = hasStores
    ? blockedStores.map(normalizeHostname)
    : [];

  return safeProducts.filter(product => {
    // Check for blacklisted keywords
    if (lowercasedKeywords.length > 0) {
      const name = (product.name || '').toLowerCase();
      const description = (product.description || '').toLowerCase();
      const hasKeyword = lowercasedKeywords.some(keyword => 
        name.includes(keyword) || description.includes(keyword)
      );
      if (hasKeyword) {
        return false; // Exclude product
      }
    }

    // Check for blocked stores
    if (normalizedBlockedStores.length > 0) {
      const storeUrl = product.store?.url || '';
      const vendorName = (product.vendor || '').toLowerCase();
      const normalizedStoreUrl = normalizeHostname(storeUrl);

      const isStoreBlocked = normalizedBlockedStores.some(blockedStore => 
        (normalizedStoreUrl && normalizedStoreUrl.includes(blockedStore)) || 
        (vendorName && vendorName.includes(blockedStore))
      );

      if (isStoreBlocked) {
        return false; // Exclude product
      }
    }

    return true; // Include product if it passes all checks
  });
};
