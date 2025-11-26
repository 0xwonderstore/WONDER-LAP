export interface Product {
  id: string;
  name: string; // Mapped from 'title'
  description?: string; // Mapped from 'body_html' or similar
  url: string; // The product URL
  vendor: string;
  store: {
    name: string;
    url: string;
    facebook_page_id?: string;
  };
  images: {
    id: number | string;
    src: string;
  }[]; // Should be an array of objects with src
  price: string;
  currency: string;
  language: string; 
  country?: string;
  created_at: string;
  
  // Original fields (optional if you want to keep them for reference, but best to stick to a unified model)
  title?: string;
  body_html?: string;
  product_type?: string;
  handle?: string;
  updated_at?: string;
  published_at?: string;
  tags?: string;
  variants?: any[];
  options?: any[];
  image?: {
      id: number;
      src: string;
  } | null;
  favorite?: boolean; // Client-side state
}

// Corrected InstagramPost interface to use postedAt and include username
export interface InstagramPost {
  id: string;
  username: string;
  media_type: 'image' | 'video' | 'CAROUSEL_ALBUM';
  media_url: string;
  thumbnail_url?: string; // For videos
  likes: number;
  comments: number;
  timestamp: string;
  permalink: string;
  caption?: string;
  language?: string;
}
