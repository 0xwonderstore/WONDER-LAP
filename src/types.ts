export type Locale = 'ar' | 'en';

export interface Product {
  id: number;
  name: string;
  url: string;
  store: {
    name: string;
    url: string;
  };
  images: {
    id: number;
    src: string;
    alt: string | null;
  }[];
  price: string;
  currency: string;
  language: string;
  country: string;
  created_at: string;
  description: string;
}
