// src/types.ts

export interface Product {
    id: string;
    name: string;
    url: string;
    vendor: string;
    store: {
        name: string;
        url: string;
        facebook_page_id?: string;
    };
    images: { id: string; src: string }[];
    price: string;
    currency: string;
    language: string;
    country?: string;
    created_at: string;
    description?: string;
}

export interface InstagramPost {
    username: string;
    permalink: string;
    media_url: string;
    media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
    thumbnail_url?: string;
    caption: string;
    likes: number;
    comments: number;
    timestamp: string;
}

export interface FacebookPost {
    username: string;
    permalink: string;
    media_type: 'image' | 'video';
    likes: number;
    comments: number;
    shares: number;
    timestamp: string;
}

export interface StoreRow {
  vendor: string;
  totalProducts: number;
  newProducts30d: number;
  newProducts60d: number;
  newProducts90d: number;
  newProducts180d: number;
  newProducts30dPercentage: number;
  newProducts60dPercentage: number;
  newProducts90dPercentage: number;
  newProducts180dPercentage: number;
  activityRate30d: number;
  activityRate60d: number;
  activityRate90d: number;
  activityRate180d: number;
  lastProductAdded: string;
  firstProductAdded: string;
  language?: string;
  avgDailyProducts?: string;
}

export interface KeywordItem {
  text: string;
  value: number;
}

export interface LanguageItem {
  code: string;
  count: number;
}

export type ActiveView = 'stores' | 'keywords' | 'languages';
