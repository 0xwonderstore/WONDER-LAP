import { Product } from '../types';
import { normalizeUrl } from './urlUtils';

export interface LoadProductsResult {
    uniqueProducts: Product[];
    allProducts: Product[];
    totalBeforeFilter: number;
    uniqueCount: number;
}

export async function loadProducts(): Promise<LoadProductsResult> {
    const allProducts: Product[] = [];

    // Linking to product files in src/data/products
    // Using explicit path pattern to ensure all files are picked up
    const modules = import.meta.glob('/src/data/products/*.json');

    for (const path in modules) {
        try {
            const module: any = await modules[path]();
            // Vite wraps JSON modules in a `default` export.
            // Handle both { "products": [...] } and direct [...] formats.
            const productsPage = Array.isArray(module.default) ? module.default : module.default?.products;

            if (productsPage && Array.isArray(productsPage)) {
                const mappedProducts = productsPage.map((p: any, index: number) => {
                    // Generate a fallback ID if missing. 
                    // Many json files might not have 'id', so we use 'url' or generate one.
                    const productId = p.id || p.url || `product-${Date.now()}-${Math.random()}`;

                    return {
                        id: productId,
                        name: p.title || 'Untitled Product',
                        url: normalizeUrl(p.url),
                        vendor: p.vendor || 'Unknown',
                        store: {
                            name: p.vendor || 'Unknown',
                            url: normalizeUrl(p.vendor_url || (p.vendor && p.vendor.includes('.') ? `https://${p.vendor}` : '')), 
                            facebook_page_id: p.facebook_page_id,
                        },
                        // Ensure images have the required structure with ID
                        images: Array.isArray(p.images) ? p.images.map((img: any, imgIndex: number) => ({
                            id: img.id || `${productId}-img-${imgIndex}`,
                            src: img.src || img // Handle case where img might be just a string, though sample showed object
                        })) : [],
                        price: p.price || '0',
                        currency: p.currency || 'USD',
                        language: p.language || 'en',
                        country: p.country,
                        created_at: p.created_at || new Date().toISOString(),
                        description: p.description || '',
                    };
                });
                allProducts.push(...mappedProducts);
            }
        } catch (error) {
            console.error(`Error loading or processing ${path}:`, error);
        }
    }

    const totalBeforeFilter = allProducts.length;

    // Ensure all products are unique by their URL.
    const seenUrls = new Set<string>();
    
    const uniqueProducts = allProducts.filter(product => {
        // Products must have a name and at least one image to be considered valid.
        if (!product || !product.url || !product.name || !product.images || !Array.isArray(product.images) || product.images.length === 0) {
            return false;
        }

        if (seenUrls.has(product.url)) {
            return false; // Duplicate url, so filter it out.
        }

        // If we've reached this point, the product is unique.
        // Add its name and image URLs to the sets for future checks.
        seenUrls.add(product.url);
        
        return true; // Keep this product.
    });

    return {
        uniqueProducts,
        allProducts,
        totalBeforeFilter,
        uniqueCount: uniqueProducts.length,
    };
}
