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
      // We check against both the product's store URL and the vendor name
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
