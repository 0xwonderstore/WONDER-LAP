import { InstagramPost } from '../types';

export async function loadInstagramPosts(): Promise<InstagramPost[]> {
    const modules = import.meta.glob('/src/data/instagram/*.json');
    
    const loadPromises = Object.entries(modules).map(async ([path, loader]) => {
        try {
            const module: any = await loader();
            const postsPage = Array.isArray(module.default) ? module.default : module.default?.posts;
            if (postsPage && Array.isArray(postsPage)) {
                return postsPage;
            }
            return [];
        } catch (error) {
            console.error(`Error loading instagram file ${path}:`, error);
            return [];
        }
    });

    const results = await Promise.all(loadPromises);
    return results.flat();
}
