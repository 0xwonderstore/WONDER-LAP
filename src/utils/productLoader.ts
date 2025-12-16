import { Product } from '../types';
import { normalizeUrl } from './urlUtils';

export interface LoadProductsResult {
    uniqueProducts: Product[];
    allProducts: Product[];
    totalBeforeFilter: number;
    uniqueCount: number;
}

// Cache the result to avoid re-loading/re-processing on every call
let cachedResult: LoadProductsResult | null = null;

export async function loadProducts(): Promise<LoadProductsResult> {
    if (cachedResult) {
        return cachedResult;
    }

    // Linking to product files in src/data/products
    const modules = import.meta.glob('/src/data/products/*.json');

    const loadPromises = Object.entries(modules).map(async ([path, loader]) => {
        try {
            const module: any = await loader();
            const productsPage = Array.isArray(module.default) ? module.default : module.default?.products;

            if (productsPage && Array.isArray(productsPage)) {
                return productsPage.map((p: any, index: number) => {
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
            }
            return [];
        } catch (error) {
            console.error(`Error loading or processing ${path}:`, error);
            return [];
        }
    });

    const results = await Promise.all(loadPromises);
    const allProducts: Product[] = results.flat();

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

    // Advanced Deduplication
    const seenUrls = new Set<string>();
    const seenTitles = new Set<string>(); // Key: vendor + title (lowercased)
    
    const uniqueProducts = allProducts.filter(product => {
        // Validity Check
        if (!product || !product.url || !product.name || !product.images || !Array.isArray(product.images) || product.images.length === 0) {
            return false;
        }

        // 1. Check Normalized URL
        if (seenUrls.has(product.url)) {
            return false; 
        }

        // 2. Check Duplicate Title within same Store
        // Normalize title: trim and lowercase
        const titleKey = `${product.vendor}::${product.name.trim().toLowerCase()}`;
        if (seenTitles.has(titleKey)) {
            return false;
        }

        seenUrls.add(product.url);
        seenTitles.add(titleKey);
        
        return true; 
    });

    cachedResult = {
        uniqueProducts,
        allProducts,
        totalBeforeFilter,
        uniqueCount: uniqueProducts.length,
    };

    return cachedResult;
}
