import { Product } from '../types';

export const formatDate = (dateString: string | Date): string => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
};

export const filterProducts = (
  products: Product[],
  blacklistedKeywords: string[],
): Product[] => {
  const safeProducts = products || [];

  if (!blacklistedKeywords || blacklistedKeywords.length === 0 || safeProducts.length === 0) {
    return safeProducts;
  }

  const lowercasedKeywords = blacklistedKeywords
    .map(k => k.toLowerCase().trim())
    .filter(Boolean);

  if (lowercasedKeywords.length === 0) {
    return safeProducts;
  }

  return safeProducts.filter(product => {
    const isBlacklisted = lowercasedKeywords.some(keyword => {
      const title = (product.title || '').toLowerCase();
      const description = (product.description || '').toLowerCase();
      
      return title.includes(keyword) || description.includes(keyword);
    });

    return !isBlacklisted;
  });
};
