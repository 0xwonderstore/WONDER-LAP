import { Product, FilterConfig, SortKey, SortOrder, DateRangePreset } from './types';

// --- Filtering and Sorting ---

export const applyFiltersAndSort = (
  products: Product[],
  filters: FilterConfig,
  sortKey: SortKey,
  sortOrder: SortOrder
): Product[] => {
  let filteredProducts = [...products];

  // Date range filter
  if (filters.dateRange && filters.dateRange !== 'all') {
    if (filters.dateRange === 'custom') {
      const startDate = filters.customStartDate ? new Date(filters.customStartDate) : null;
      const endDate = filters.customEndDate ? new Date(filters.customEndDate) : null;
      if (endDate) endDate.setHours(23, 59, 59, 999);
      filteredProducts = filteredProducts.filter(p => {
        const productDate = new Date(p.created_at);
        if (startDate && endDate) return productDate >= startDate && productDate <= endDate;
        if (startDate) return productDate >= startDate;
        if (endDate) return productDate <= endDate;
        return true;
      });
    } else {
      const now = new Date();
      let startDate = new Date();
      switch (filters.dateRange) {
        case 'past_week': startDate.setDate(now.getDate() - 7); break;
        case 'past_month': startDate.setMonth(now.getMonth() - 1); break;
      }
      filteredProducts = filteredProducts.filter(p => new Date(p.created_at) >= startDate && new Date(p.created_at) <= now);
    }
  }

  // Text-based filters
  if (filters.title) {
    filteredProducts = filteredProducts.filter(p => p.title.toLowerCase().includes(filters.title!.toLowerCase()));
  }
  if (filters.vendor) {
    filteredProducts = filteredProducts.filter(p => p.vendor === filters.vendor);
  }

  // Sorting logic
  filteredProducts.sort((a, b) => {
    const aValue = a[sortKey];
    const bValue = b[sortKey];
    if (sortKey === 'created_at') {
      return (new Date(bValue).getTime() - new Date(aValue).getTime()) * (sortOrder === 'desc' ? 1 : -1);
    }
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return aValue.localeCompare(bValue) * (sortOrder === 'asc' ? 1 : -1);
    }
    return 0;
  });

  return filteredProducts;
};


// --- Formatting ---

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// --- External Links ---

const FACEBOOK_AD_LIBRARY_URLS: Record<string, string> = {
  'cozyhoome': 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&view_all_page_id=112757221912564',
  'elenoradz': 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=%22elenoradz%22&search_type=keyword_exact_phrase',
  'eleganceaccessoires': 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=%22eleganceaccessoires%22&search_type=keyword_exact_phrase',
  'latafastore': 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&view_all_page_id=107582595350263',
  'metashopjo': 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&view_all_page_id=167536333754597',
  'allaffaire': 'https://allaffaire.com/products/jupe-lumineuse-led-princess',
  'unknown': 'https://www.facebook.com/ads/library'
};

export function getFacebookAdLibraryUrl(vendor: string): string {
  const normalizedVendor = vendor.toLowerCase().replace('.shop', '').replace('.com', '');
  return FACEBOOK_AD_LIBRARY_URLS[normalizedVendor] || `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=ALL&q=${encodeURIComponent(normalizedVendor)}&search_type=keyword_exact_phrase`;
}
