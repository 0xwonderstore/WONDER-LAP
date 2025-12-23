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
// Memoized to avoid re-calculation for the same URL
const hostnameCache = new Map<string, string>();

export const normalizeHostname = (url: string): string => {
  if (!url) return '';
  if (hostnameCache.has(url)) return hostnameCache.get(url)!;
  
  // Strips protocol, 'www.' prefix, and any path. Converts to lowercase.
  const normalized = url.trim().toLowerCase().replace(/^(?:https?|ftp):\/\//, '').replace(/^(?:www\.)?/, '').split('/')[0];
  hostnameCache.set(url, normalized);
  return normalized;
};

/**
 * A more robust search function that normalizes text for better matching.
 * It handles different character cases and accents.
 */
// Memoize text normalization for common strings if needed, but simple string ops are usually fast enough.
// We can inline the regex for performance if called frequently.
const combiningDiacritics = /[\u0300-\u036f]/g;

const normalizeText = (text: string): string => {
    if (!text) return '';
    return text
        .toLowerCase()
        // NFD: Normalization Form Canonical Decomposition.
        .normalize('NFD')
        // This regex removes the separated diacritical marks (accents, etc.).
        .replace(combiningDiacritics, '');
};

export const searchProducts = (
    products: Product[],
    searchTerm: string
): Product[] => {
    if (!searchTerm) {
        return products;
    }

    const normalizedSearchTerm = normalizeText(searchTerm);

    // Optimized filter loop
    const result: Product[] = [];
    for (let i = 0; i < products.length; i++) {
        const product = products[i];
        const normalizedName = normalizeText(product.name || '');
        // Only normalize description if name doesn't match to save time
        if (normalizedName.includes(normalizedSearchTerm)) {
            result.push(product);
            continue;
        }
        
        const normalizedDescription = normalizeText(product.description || '');
        if (normalizedDescription.includes(normalizedSearchTerm)) {
            result.push(product);
        }
    }
    return result;
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
  
  // Pre-calculate normalized blocked stores set for O(1) lookup logic where possible, 
  // though we are doing substring matching so we still need to iterate.
  // But we can cache the normalization of blocked stores.
  const normalizedBlockedStores = hasStores
    ? blockedStores.map(normalizeHostname)
    : [];

  const result: Product[] = [];

  for (let i = 0; i < safeProducts.length; i++) {
      const product = safeProducts[i];
      let excluded = false;

      // Check for blacklisted keywords
      if (hasKeywords) {
          const name = (product.name || '').toLowerCase();
          // Check name first as it's shorter
          if (lowercasedKeywords.some(keyword => name.includes(keyword))) {
              excluded = true;
          } else {
             const description = (product.description || '').toLowerCase();
             if (lowercasedKeywords.some(keyword => description.includes(keyword))) {
                 excluded = true;
             }
          }
      }

      if (excluded) continue;

      // Check for blocked stores
      if (hasStores) {
          const storeUrl = product.store?.url || '';
          const vendorName = (product.vendor || '').toLowerCase();
          // Normalize only if we have a storeUrl, otherwise use empty string
          const normalizedStoreUrl = storeUrl ? normalizeHostname(storeUrl) : '';

          const isStoreBlocked = normalizedBlockedStores.some(blockedStore => 
              (normalizedStoreUrl && normalizedStoreUrl.includes(blockedStore)) || 
              (vendorName && vendorName.includes(blockedStore))
          );

          if (isStoreBlocked) {
              excluded = true;
          }
      }

      if (!excluded) {
          result.push(product);
      }
  }

  return result;
};

/**
 * Detect duplicate products by image URL or name similarity.
 * Returns a map of productId -> duplicateCount
 */
export const countDuplicates = (products: Product[]): Map<string, number> => {
    const duplicateMap = new Map<string, number>();
    const imageCount = new Map<string, number>();
    const nameCount = new Map<string, number>();

    // First pass: Count occurrences
    for (const product of products) {
        if (product.images?.[0]?.src) {
            const img = product.images[0].src;
            imageCount.set(img, (imageCount.get(img) || 0) + 1);
        } else if (product.name) {
            const name = normalizeText(product.name);
            nameCount.set(name, (nameCount.get(name) || 0) + 1);
        }
    }

    // Second pass: Assign counts to products
    for (const product of products) {
        let count = 0;
        if (product.images?.[0]?.src) {
             const img = product.images[0].src;
             count = imageCount.get(img) || 0;
        } else if (product.name) {
             const name = normalizeText(product.name);
             count = nameCount.get(name) || 0;
        }
        
        // If count > 1, it means there are duplicates (including itself).
        // The display logic might want to show "X duplicates found" which usually means X other items.
        // Or "Appears X times". Let's assume we want to show total occurrences if > 1.
        if (count > 1) {
             // We map by product URL or ID to ensure we can look it up in the component
             duplicateMap.set(product.url, count);
        }
    }

    return duplicateMap;
};
