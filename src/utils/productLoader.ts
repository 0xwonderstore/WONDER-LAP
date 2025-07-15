import { Product } from '../types';

async function fetchProductFile(fileName: string): Promise<any[]> {
    try {
        const response = await fetch(`/src/data/${fileName}`);
        if (!response.ok) {
            if (response.status === 404) return []; // File not found, expected for some names
            throw new Error(`Failed to fetch ${fileName}: ${response.statusText}`);
        }
        const data = await response.json();
        // The data is an object with a "products" key
        return data.products;
    } catch (error) {
        if (error instanceof SyntaxError) {
            console.warn(`Syntax error in ${fileName}, skipping.`);
            return [];
        }
        console.error(`Error loading ${fileName}:`, error);
        return [];
    }
}

export async function loadProducts(): Promise<Product[]> {
    const allProducts: Product[] = [];
    
    for (let i = 1; i <= 40; i++) {
        const productsPage = await fetchProductFile(`products_${i}.json`);
        
        if (productsPage && productsPage.length > 0) {
            const mappedProducts = productsPage.map((p: any) => ({
                id: p.id,
                // --- FIX: Use 'title' from JSON for the product name ---
                name: p.title, 
                url: p.url,
                store: {
                    name: p.vendor,
                    url: p.vendor_url, 
                },
                images: p.images,
                price: p.price,
                currency: p.currency,
                language: p.language || 'en',
                country: p.country,
                created_at: p.created_at,
                description: p.description
            }));
            allProducts.push(...mappedProducts);
        }
    }
    
    const uniqueProducts = Array.from(new Map(allProducts.map(p => [p.url, p])).values());
    
    return uniqueProducts;
}
