import { InstagramPost } from '../types';

export async function loadInstagramPosts(): Promise<InstagramPost[]> {
    const allPosts: InstagramPost[] = [];
    const modules = import.meta.glob('/src/data/instagram/*.json');

    for (const path in modules) {
        try {
            const module: any = await modules[path]();
            const postsPage = Array.isArray(module.default) ? module.default : module.default?.posts;
            if (postsPage && Array.isArray(postsPage)) {
                allPosts.push(...postsPage);
            }
        } catch (error) {
            console.error(`Error loading instagram file ${path}:`, error);
        }
    }
    return allPosts;
}
