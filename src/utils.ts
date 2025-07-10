import { Product, FilterConfig, DateRangePreset } from './types';

export const applyFiltersAndSort = (
  products: Product[],
  filters: FilterConfig
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

  // The default sort is now handled in productLoader. This function only filters.
  return filteredProducts;
};

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
