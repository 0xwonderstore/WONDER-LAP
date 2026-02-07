import { FacebookPost } from '../types';

// Explicit imports to ensure all files are linked and loaded correctly
import posts1 from '../data/facebook/facebook_posts_1.json';
import posts2 from '../data/facebook/facebook_posts_2.json';
import posts3 from '../data/facebook/facebook_posts_3.json';
import posts4 from '../data/facebook/facebook_posts_4.json';
import posts5 from '../data/facebook/facebook_posts_5.json';

export async function loadFacebookPosts(): Promise<FacebookPost[]> {
    try {
        // Aggregate all posts from the imported JSON files
        const allPosts: FacebookPost[] = [
            ...(posts1 as unknown as FacebookPost[]),
            ...(posts2 as unknown as FacebookPost[]),
            ...(posts3 as unknown as FacebookPost[]),
            ...(posts4 as unknown as FacebookPost[]),
            ...(posts5 as unknown as FacebookPost[]),
        ];
        
        return allPosts;
    } catch (error) {
        console.error("Error loading Facebook posts:", error);
        return [];
    }
}
