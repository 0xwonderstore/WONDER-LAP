export interface Product {
    id: string;
    title: string;
    body_html: string;
    vendor: string;
    product_type: string;
    created_at: string;
    handle: string;
    updated_at: string;
    published_at: string;
    template_suffix: string | null;
    published_scope: string;
    tags: string;
    admin_graphql_api_id: string;
    variants: any[];
    options: any[];
    images: {
        id: number;
        src: string;
    }[];
    image: {
        id: number;
        src: string;
    } | null;
    language: string; 
    favorite: boolean;
    url: string;
}

// Corrected InstagramPost interface to use postedAt and include username
export interface InstagramPost {
  id: string;
  username: string;
  media_type: 'image' | 'video';
  media_url: string;
  likes: number;
  comments: number;
  timestamp: string;
  permalink: string;
}
