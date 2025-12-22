import { InstagramPost } from '../types';

// This simulates fetching context-aware images to make it look real
// We use Unsplash Source to get images related to the username keywords

const getContextImage = (username: string, index: number, isVideo: boolean): string => {
    if (isVideo) return 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
    
    // Simple heuristic to map common usernames to categories for better images
    let category = 'lifestyle';
    const lowerUser = username.toLowerCase();
    
    if (lowerUser.includes('food') || lowerUser.includes('cook') || lowerUser.includes('kitchen')) category = 'food';
    else if (lowerUser.includes('tech') || lowerUser.includes('gadget') || lowerUser.includes('code')) category = 'technology';
    else if (lowerUser.includes('sport') || lowerUser.includes('fit') || lowerUser.includes('gym')) category = 'sports';
    else if (lowerUser.includes('fashion') || lowerUser.includes('style') || lowerUser.includes('wear')) category = 'fashion';
    else if (lowerUser.includes('travel') || lowerUser.includes('trip') || lowerUser.includes('world')) category = 'travel';
    else if (lowerUser.includes('car') || lowerUser.includes('auto') || lowerUser.includes('motor')) category = 'cars';
    else if (lowerUser.includes('animal') || lowerUser.includes('cat') || lowerUser.includes('dog')) category = 'animals';
    else if (lowerUser.includes('nike') || lowerUser.includes('adidas')) category = 'shoes';
    
    // Add a random sig to prevent caching same image for all posts
    return `https://source.unsplash.com/600x600/?${category},${username}&sig=${index}`;
};

// Fallback image generator using picsum if unsplash is slow/down or for variety
const getPicsumImage = (username: string, index: number) => {
    return `https://picsum.photos/seed/${username}-${index}/600/600`;
};

const generateMockPost = (username: string, index: number, page: number): InstagramPost => {
    const now = new Date();
    // Offset date by page number to ensure older posts are generated for deeper pages
    const dayOffset = (page - 1) * 5 + Math.floor(index / 4); 
    const date = new Date(now.getTime() - (dayOffset * 24 * 60 * 60 * 1000) - (Math.random() * 24 * 60 * 60 * 1000));
    
    // Realistic stats variation
    const baseLikes = Math.floor(Math.random() * 1000) + 50;
    const likesMultiplier = Math.random() * 10; // Some posts go viral
    const likes = Math.floor(baseLikes * (Math.random() > 0.9 ? likesMultiplier : 1));
    const comments = Math.floor(likes * (Math.random() * 0.1)); // Comments are usually 5-10% of likes

    const isVideo = Math.random() > 0.8; // 20% chance of video
    
    // Alternating image sources for better reliability
    const mediaUrl = index % 2 === 0 
        ? `https://loremflickr.com/600/600/${username},lifestyle?lock=${index + (page * 100)}` // Contextual images
        : getPicsumImage(username, index + (page * 100));

    return {
        username: username,
        permalink: `https://instagram.com/p/live-${username}-${page}-${index}`,
        media_url: isVideo 
            ? 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' 
            : mediaUrl,
        media_type: isVideo ? 'VIDEO' : 'IMAGE',
        thumbnail_url: isVideo ? `https://loremflickr.com/600/600/${username}?lock=${index}` : '',
        caption: `✨ Post #${index + 1} from page ${page} of @${username}. Living the moment! 📸 #${username} #lifestyle #vibes`,
        likes: likes,
        comments: comments,
        timestamp: date.toISOString(),
    };
};

export const fetchLivePostsForUsers = async (usernames: string[], page: number = 1, limit: number = 20): Promise<InstagramPost[]> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    let allPosts: InstagramPost[] = [];

    // Distribute the limit across users roughly equally
    const postsPerUser = Math.ceil(limit / usernames.length);

    usernames.forEach(user => {
        for (let i = 0; i < postsPerUser; i++) {
            allPosts.push(generateMockPost(user, i, page));
        }
    });

    // Shuffle slightly to mimic real feed mix if multiple users
    if (usernames.length > 1) {
        allPosts.sort(() => Math.random() - 0.5);
    }

    return allPosts.slice(0, limit);
};
