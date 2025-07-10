export interface Product {
  [key: string]: any;
  url: string;
  title: string;
  avg_price: number;
  vendor: string;
  created_at: string;
  variants: ProductVariant[];
  images: ProductImage[];
}

export interface ProductVariant {
  price: string;
  compare_at_price: string | null;
}

export interface ProductImage {
  src: string;
  width: number;
  height: number;
}

export type DateRangePreset = 
  | 'all' 
  | 'past_week' 
  | 'past_month' 
  | 'custom';

export interface FilterConfig {
  title?: string;
  vendor?: string;
  dateRange?: DateRangePreset;
  customStartDate?: string;
  customEndDate?: string;
}
