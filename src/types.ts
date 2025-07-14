
export interface Product {
    id: string;
    title: string;
    vendor: string;
    body_html: string;
    images: { src: string }[];
    created_at: string;
    url: string;
  }
  
  export interface FilterConfig {
    title: string;
    vendor: string;
    dateRange: 'all' | 'custom';
    customStartDate: string;
    customEndDate: string;
  }

  export type SortKey = 'created_at' | 'title' | 'vendor';

  export type SortOrder = 'asc' | 'desc';
