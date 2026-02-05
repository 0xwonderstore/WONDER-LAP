import { FacebookPost } from '../types';

export async function loadFacebookPosts(): Promise<FacebookPost[]> {
    const modules = import.meta.glob('../data/facebook/*.json');
    
    const loadPromises = Object.entries(modules).map(async ([path, loader]) => {
        try {
            const module: any = await loader();
            const posts = Array.isArray(module.default) ? module.default : [];
            return posts;
        } catch (error) {
            console.error(`Error loading Facebook posts from ${path}:`, error);
            return [];
        }
    });

    const results = await Promise.all(loadPromises);
    return results.flat();
}
