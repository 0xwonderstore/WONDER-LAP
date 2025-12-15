// src/types.ts

export interface Product {
  id: string;
  name: string;
  store: string;
  price: number;
  currency: string;
  imageUrl: string;
  productUrl: string;
  timestamp: string;
  vendor: string;
  created_at: string;
  language?: string;
  meta?: {
    [key: string]: any;
  };
}

export interface InstagramPost {
  id: string;
  caption: string;
  media_url: string;
  timestamp: string;
  username: string;
  permalink: string;
  media_type: string;
  language?: string;
  meta?: {
    [key: string]: any;
  };
}

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

// --- Dashboard Specific Types ---

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
