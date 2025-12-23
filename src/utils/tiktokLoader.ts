import { TikTokPost } from '../types';

let cachedTikTokPosts: TikTokPost[] | null = null;

export async function loadTikTokPosts(): Promise<TikTokPost[]> {
    if (cachedTikTokPosts) {
        return cachedTikTokPosts;
    }

    const modules = import.meta.glob('/src/data/tiktok/*.json');
    
    const loadPromises = Object.entries(modules).map(async ([path, loader]) => {
        try {
            const module: any = await loader();
            const postsPage = Array.isArray(module.default) ? module.default : module.default?.posts;
            if (postsPage && Array.isArray(postsPage)) {
                return postsPage;
            }
            return [];
        } catch (error) {
            console.error(`Error loading tiktok file ${path}:`, error);
            return [];
        }
    });

    const results = await Promise.all(loadPromises);
    cachedTikTokPosts = results.flat();
    return cachedTikTokPosts;
}
