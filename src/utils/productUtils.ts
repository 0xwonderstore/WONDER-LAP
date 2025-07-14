
import { Product, FilterConfig, SortKey, SortOrder } from '../types';

export const applyFiltersAndSort = (
  products: Product[],
  filters: FilterConfig,
  sortKey: SortKey,
  sortOrder: SortOrder
): Product[] => {
  let filteredProducts = [...products];

  if (filters.title) {
    filteredProducts = filteredProducts.filter(p => p.title.toLowerCase().includes(filters.title.toLowerCase()));
  }
  if (filters.vendors && filters.vendors.length > 0) {
    filteredProducts = filteredProducts.filter(p => filters.vendors.includes(p.vendor));
  }
  if (filters.language) {
    filteredProducts = filteredProducts.filter(p => p.language === filters.language);
  }

  if (filters.dateRange === 'custom' && filters.customStartDate && filters.customEndDate) {
    const startDate = new Date(filters.customStartDate);
    const endDate = new Date(filters.customEndDate);
    filteredProducts = filteredProducts.filter(p => {
      const productDate = new Date(p.created_at);
      return productDate >= startDate && productDate <= endDate;
    });
  }

  filteredProducts.sort((a, b) => {
    const aValue = a[sortKey];
    const bValue = b[sortKey];
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  return filteredProducts;
};

export const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
};
