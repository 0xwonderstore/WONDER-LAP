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
    const modules = import.meta.glob('/src/data/products/*.json');

    for (const path in modules) {
        try {
            const module: any = await modules[path]();
            const productsPage = Array.isArray(module.default) ? module.default : module.default?.products;

            if (productsPage && Array.isArray(productsPage)) {
                const mappedProducts = productsPage.map((p: any, index: number) => {
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
                        images: Array.isArray(p.images) ? p.images.map((img: any, imgIndex: number) => ({
                            id: img.id || `${productId}-img-${imgIndex}`,
                            src: img.src || img 
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

    // Logic: If a store has at least one Arabic product, classify the entire store as Arabic.
    const arabicStores = new Set<string>();
    
    allProducts.forEach(product => {
        if (product.language === 'ar') {
             if (product.vendor) arabicStores.add(product.vendor);
             if (product.store?.name) arabicStores.add(product.store.name);
        }
    });

    if (arabicStores.size > 0) {
        allProducts.forEach(product => {
            if ((product.vendor && arabicStores.has(product.vendor)) || 
                (product.store?.name && arabicStores.has(product.store.name))) {
                product.language = 'ar';
            }
        });
    }

    const totalBeforeFilter = allProducts.length;

    // Ensure all products are unique by their URL.
    const seenUrls = new Set<string>();
    
    const uniqueProducts = allProducts.filter(product => {
        if (!product || !product.url || !product.name || !product.images || !Array.isArray(product.images) || product.images.length === 0) {
            return false;
        }

        if (seenUrls.has(product.url)) {
            return false; 
        }

        seenUrls.add(product.url);
        return true; 
    });

    return {
        uniqueProducts,
        allProducts,
        totalBeforeFilter,
        uniqueCount: uniqueProducts.length,
    };
}
