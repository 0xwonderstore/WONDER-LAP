import { Product } from '../types';

/**
 * Modern product loader using Vite's dynamic import.
 * This is more robust than fetch() for local project files.
 */
export async function loadProducts(): Promise<Product[]> {
    const allProducts: Product[] = [];

    // Use Vite's glob import to find all product files automatically.
    const modules = import.meta.glob('/src/data/products_*.json');

    for (const path in modules) {
        try {
            const module: any = await modules[path]();
            // Vite wraps JSON modules in a `default` export.
            const productsPage = module.default?.products;

            if (productsPage && Array.isArray(productsPage)) {
                const mappedProducts = productsPage.map((p: any) => ({
                    id: p.id,
                    name: p.title,
                    url: p.url,
                    vendor: p.vendor,
                    store: {
                        name: p.vendor,
                        url: p.vendor_url,
                        facebook_page_id: p.facebook_page_id,
                    },
                    images: p.images,
                    price: p.price,
                    currency: p.currency,
                    language: p.language || 'en',
                    country: p.country,
                    created_at: p.created_at,
                    description: p.description,
                }));
                allProducts.push(...mappedProducts);
            }
        } catch (error) {
            console.error(`Error loading or processing ${path}:`, error);
        }
    }

    // Ensure all products are unique by their URL
    const uniqueProducts = Array.from(new Map(allProducts.map(p => [p.url, p])).values());
    
    return uniqueProducts;
}
