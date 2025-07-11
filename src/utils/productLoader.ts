import { Product } from '../types';
import { isClothingProduct } from './clothingFilter';

const normalizeTitle = (title: string): string => {
  if (!title) return '';
  return title.toLowerCase().replace(/\s+/g, ' ').trim();
};

export async function loadProducts(): Promise<Product[]> {
  // Use a recursive glob pattern to find all product files within the /src directory.
  // This is much more flexible and will discover files in any sub-folder.
  // e.g., /src/data/products_1.json, /src/data/shopify/products_a.json, etc.
  const productModules = import.meta.glob('/src/**/products_*.json', { eager: true, import: 'default' });

  try {
    const uniqueProducts = new Map<string, Product>();
    const processedCompositeKeys = new Set<string>();

    for (const path in productModules) {
      const fileContent: any = productModules[path];
      
      if (fileContent && Array.isArray(fileContent.products)) {
        for (const product of fileContent.products) {
          if (!product.url || !product.title || !product.vendor) {
            continue; 
          }

          if (uniqueProducts.has(product.url)) {
            continue;
          }

          const normalizedTitle = normalizeTitle(product.title);
          const compositeKey = `${product.vendor}||${normalizedTitle}`;

          if (processedCompositeKeys.has(compositeKey)) {
            continue; 
          }

          uniqueProducts.set(product.url, product);
          processedCompositeKeys.add(compositeKey);
        }
      }
    }

    const allProducts = Array.from(uniqueProducts.values());

    // The default sort is always newest first.
    return allProducts.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  } catch (error) {
    console.error('Error loading products:', error);
    return [];
  }
}
