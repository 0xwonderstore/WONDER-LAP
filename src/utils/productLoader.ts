import { Product } from '../types';
import { normalizeUrl } from './urlUtils';

export interface LoadProductsResult {
    uniqueProducts: Product[];
    totalBeforeFilter: number;
    uniqueCount: number;
}


/**
 * Modern product loader using Vite's dynamic import.
 * This is more robust than fetch() for local project files.
 */
export async function loadProducts(): Promise<LoadProductsResult> {
    const allProducts: Product[] = [];

    // Use Vite's glob import to find all product files automatically.
    const modules = import.meta.glob('/src/data/products_*.json');

    for (const path in modules) {
        try {
            const module: any = await modules[path]();
            // Vite wraps JSON modules in a `default` export.
            // Handle both { "products": [...] } and direct [...] formats.
            const productsPage = Array.isArray(module.default) ? module.default : module.default?.products;


            if (productsPage && Array.isArray(productsPage)) {
                const mappedProducts = productsPage.map((p: any) => ({
                    id: p.id,
                    name: p.title,
                    url: normalizeUrl(p.url), // <-- Normalize URL here
                    vendor: p.vendor,
                    store: {
                        name: p.vendor,
                        url: normalizeUrl(p.vendor_url), // <-- Normalize store URL
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
        } catch (error) => {
            console.error(`Error loading or processing ${path}:`, error);
        }
    }

    const totalBeforeFilter = allProducts.length;

    // Ensure all products are unique by their name (case-insensitive) and image URLs.
    const seenNames = new Set<string>();
    const seenImageUrls = new Set<string>();
    
    const uniqueProducts = allProducts.filter(product => {
        // Products must have a name and at least one image to be considered valid.
        if (!product || !product.name || !product.images || !Array.isArray(product.images) || product.images.length === 0) {
            return false;
        }

        const lowerCaseName = product.name.toLowerCase();
        if (seenNames.has(lowerCaseName)) {
            return false; // Duplicate name, so filter it out.
        }

        // Check if any of the product's image URLs have already been seen.
        const hasDuplicateImage = product.images.some(image => image && image.src && seenImageUrls.has(image.src));
        if (hasDuplicateImage) {
            return false; // Duplicate image, so filter it out.
        }

        // If we've reached this point, the product is unique.
        // Add its name and image URLs to the sets for future checks.
        seenNames.add(lowerCaseName);
        product.images.forEach(image => {
            if (image && image.src) {
                seenImageUrls.add(image.src);
            }
        });
        
        return true; // Keep this product.
    });

    return {
        uniqueProducts,
        totalBeforeFilter,
        uniqueCount: uniqueProducts.length,
    };
}
