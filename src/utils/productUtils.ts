import { Product } from '../types';

export const formatDate = (dateString: string | Date): string => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
};

const hostnameCache = new Map<string, string>();

export const normalizeHostname = (url: string): string => {
  if (!url) return '';
  if (hostnameCache.has(url)) return hostnameCache.get(url)!;
  
  const normalized = url.trim().toLowerCase().replace(/^(?:https?|ftp):\/\//, '').replace(/^(?:www\.)?/, '').split('/')[0];
  hostnameCache.set(url, normalized);
  return normalized;
};

const combiningDiacritics = /[\u0300-\u036f]/g;

const normalizeText = (text: string): string => {
    if (!text) return '';
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(combiningDiacritics, '');
};

export const searchProducts = (
    products: Product[],
    searchTerm: string
): Product[] => {
    if (!searchTerm) {
        return products;
    }

    // Split by spaces or commas for multi-language keyword support
    const keywords = searchTerm.split(/[\s,]+/).map(kw => normalizeText(kw.trim())).filter(Boolean);

    if (keywords.length === 0) {
        return products;
    }

    const result: Product[] = [];
    for (let i = 0; i < products.length; i++) {
        const product = products[i];
        const normalizedName = normalizeText(product.name || '');
        const normalizedDescription = normalizeText(product.description || '');

        // Find products that match ANY of the keywords (OR condition)
        const matches = keywords.some(keyword => 
            normalizedName.includes(keyword) || normalizedDescription.includes(keyword)
        );

        if (matches) {
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
  
  const normalizedBlockedStores = hasStores
    ? blockedStores.map(normalizeHostname)
    : [];

  const result: Product[] = [];

  for (let i = 0; i < safeProducts.length; i++) {
      const product = safeProducts[i];
      let excluded = false;

      if (hasKeywords) {
          const name = (product.name || '').toLowerCase();
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

      if (hasStores) {
          const storeUrl = product.store?.url || '';
          const vendorName = (product.vendor || '').toLowerCase();
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

export const countDuplicates = (products: Product[]): Map<string, number> => {
    const duplicateMap = new Map<string, number>();
    const imageCount = new Map<string, number>();
    const nameCount = new Map<string, number>();

    for (const product of products) {
        if (product.images?.[0]?.src) {
            const img = product.images[0].src;
            imageCount.set(img, (imageCount.get(img) || 0) + 1);
        } else if (product.name) {
            const name = normalizeText(product.name);
            nameCount.set(name, (nameCount.get(name) || 0) + 1);
        }
    }

    for (const product of products) {
        let count = 0;
        if (product.images?.[0]?.src) {
             const img = product.images[0].src;
             count = imageCount.get(img) || 0;
        } else if (product.name) {
             const name = normalizeText(product.name);
             count = nameCount.get(name) || 0;
        }
        
        if (count > 1) {
             duplicateMap.set(product.url, count);
        }
    }

    return duplicateMap;
};
