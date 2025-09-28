export type Locale = 'ar' | 'en';

export interface Product {
  id: number;
  name: string;
  url: string;
  vendor: string;
  created_at: string;
  images: {
    id: number;
    src: string;
    alt: string | null;
  }[];
  price: string;
  currency: string;
  language?: string; // Make language optional, as not all products might have it
  description: string;
}
