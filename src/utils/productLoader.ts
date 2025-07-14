
import { Product } from '../types';

async function fetchProducts(page: number): Promise<Product[]> {
    try {
        const response = await fetch(`/src/data/products_${page}.json`);
        if (!response.ok) {
            // A 404 is an expected way to signal we're out of files.
            if (response.status === 404) return [];
            throw new Error(`Failed to fetch products page ${page}: ${response.statusText}`);
        }
        const data = await response.json();
        return data.products;
    } catch (error) {
        // A SyntaxError is also expected when the server returns an HTML fallback for a non-existent file.
        // We can safely ignore it and treat it as the end of the data.
        if (error instanceof SyntaxError) {
            return [];
        }
        // For any other type of error (network issues, etc.), we should still log it.
        console.error(`Error fetching or parsing products page ${page}:`, error);
        return [];
    }
}

export async function loadProducts(): Promise<Product[]> {
    const allProducts: Product[] = [];
    let page = 1;
    let productsPage: any[];

    do {
        productsPage = await fetchProducts(page);
        if (productsPage && productsPage.length > 0) {
            // Clean the data as it's loaded to ensure consistency
            const cleanedProducts = productsPage.map(({ language, ...rest }) => rest);
            allProducts.push(...cleanedProducts);
        }
        page++;
    } while (productsPage.length > 0 && page <= 50); // Set a reasonable limit

    // Ensure uniqueness based on product URL
    const uniqueProducts = Array.from(new Map(allProducts.map(p => [p.url, p])).values());
    
    return uniqueProducts;
}
