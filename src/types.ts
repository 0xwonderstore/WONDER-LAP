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

// Updated InstagramPost interface
export interface InstagramPost {
  id: string;
  url: string;
  displayUrl: string;
  likesCount: number;
  commentsCount: number;
  language: string;
}
