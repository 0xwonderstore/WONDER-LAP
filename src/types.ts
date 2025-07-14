
export interface Product {
    id: string;
    title: string;
    vendor: string;
    body_html: string;
    images: { src: string }[];
    created_at: string;
    language: string;
    url: string;
  }
  
  export interface FilterConfig {
    title: string;
    vendors: string[]; // Changed from 'vendor' to 'vendors' to support multiple
    language: string;
    dateRange: 'all' | 'custom';
    customStartDate: string;
    customEndDate: string;
  }

  export type SortKey = 'created_at' | 'title' | 'vendor';

  export type SortOrder = 'asc' | 'desc';

  export type VendorStat = {
    name: string;
    productCount: number;
    oldestProductDate: Date;
    newestProductDate: Date;
  };
  
  export type SortConfig<T> = {
    key: keyof T;
    direction: 'asc' | 'desc';
  };
