import { useMemo } from 'react';
import { Product, InstagramPost, FacebookPost } from '../types';
import { startOfDay, subDays, format, parseISO, eachDayOfInterval, differenceInDays } from 'date-fns';
import { instagramLanguageMapping } from '../data/instagramLanguageMapping';

export const useDashboardData = (products: Product[], posts: InstagramPost[], fbPosts: FacebookPost[] = []) => {
  return useMemo(() => {
    const now = new Date();
    // 180 days for broader trend analysis
    const trendStart = subDays(now, 180);
    const thirtyDaysAgo = subDays(now, 30);
    const sixtyDaysAgo = subDays(now, 60); 
    const dateInterval = eachDayOfInterval({ start: trendStart, end: now });

    // --- 0. Optimization: Deduplicate & Pre-parse ---
    const uniquePostsMap = new Map<string, InstagramPost & { parsedDate?: Date }>();
    posts.forEach(post => {
        if (post.permalink && !uniquePostsMap.has(post.permalink)) {
            const parsedDate = post.timestamp ? parseISO(post.timestamp) : undefined;
            uniquePostsMap.set(post.permalink, { ...post, parsedDate });
        }
    });
    const uniquePosts = Array.from(uniquePostsMap.values());

    // Deduplicate Facebook Posts
    const uniqueFbPostsMap = new Map<string, FacebookPost & { parsedDate?: Date }>();
    fbPosts.forEach(post => {
        if (post.permalink && !uniqueFbPostsMap.has(post.permalink)) {
            const parsedDate = post.timestamp ? parseISO(post.timestamp) : undefined;
            uniqueFbPostsMap.set(post.permalink, { ...post, parsedDate });
        }
    });
    const uniqueFbPosts = Array.from(uniqueFbPostsMap.values());


    // --- 1. General KPI Data ---
    const uniqueStores = new Set(products.map(p => p.vendor).filter(Boolean)).size;
    
    // Interactions (Instagram Only for now in Main KPI as requested context, or combined if desired later)
    // Keeping "Total Interactions" for Instagram context based on previous steps, but we can add separate logic.
    const totalLikes = uniquePosts.reduce((sum, p) => sum + (p.likes || 0), 0);
    const totalComments = uniquePosts.reduce((sum, p) => sum + (p.comments || 0), 0);
    const totalInteractions = totalLikes + totalComments;
    
    // Calculate Current vs Previous Period for Growth
    const newProducts30d = products.reduce((count, p) => {
        if (p.created_at && parseISO(p.created_at) >= thirtyDaysAgo) return count + 1;
        return count;
    }, 0);
    
    const newProductsPrev30d = products.reduce((count, p) => {
        if (p.created_at) {
            const d = parseISO(p.created_at);
            if (d >= sixtyDaysAgo && d < thirtyDaysAgo) return count + 1;
        }
        return count;
    }, 0);

    const newPosts30d = uniquePosts.reduce((count, p) => {
        if (p.parsedDate && p.parsedDate >= thirtyDaysAgo) return count + 1;
        return count;
    }, 0);

    const newPostsPrev30d = uniquePosts.reduce((count, p) => {
        if (p.parsedDate && p.parsedDate >= sixtyDaysAgo && p.parsedDate < thirtyDaysAgo) return count + 1;
        return count;
    }, 0);

    // --- 2. Chart Data (Time Series) - EXCLUDING Facebook ---
    const chartMap = new Map<string, { products: number; posts: number }>();
    dateInterval.forEach(date => {
        chartMap.set(format(date, 'yyyy-MM-dd'), { products: 0, posts: 0 });
    });

    products.forEach(p => {
        if (p.created_at) {
            const dateStr = p.created_at.split('T')[0];
            if (chartMap.has(dateStr)) chartMap.get(dateStr)!.products += 1;
        }
    });

    uniquePosts.forEach(p => {
        if (p.parsedDate) {
            const dateStr = format(p.parsedDate, 'yyyy-MM-dd');
            if (chartMap.has(dateStr)) chartMap.get(dateStr)!.posts += 1;
        }
    });

    const chartData = Array.from(chartMap.entries()).map(([dateKey, counts]) => ({
        date: format(parseISO(dateKey), 'MMM dd'),
        products: counts.products,
        posts: counts.posts
    }));

    // --- 3. Instagram Accounts Analysis ---
    const instagramAccountsMap = new Map<string, any>();
    uniquePosts.forEach(post => {
        if (!instagramAccountsMap.has(post.username)) {
            instagramAccountsMap.set(post.username, {
                username: post.username,
                postsCount: 0,
                totalLikes: 0,
                totalComments: 0,
                timestamps: [],
                language: instagramLanguageMapping[post.username] || 'Unknown'
            });
        }
        const user = instagramAccountsMap.get(post.username);
        user.postsCount += 1;
        user.totalLikes += (post.likes || 0);
        user.totalComments += (post.comments || 0);
        if (post.parsedDate) user.timestamps.push(post.parsedDate);
    });

    const allInstagramAccounts = Array.from(instagramAccountsMap.values()).map(user => {
        user.timestamps.sort((a: Date, b: Date) => a.getTime() - b.getTime());
        return {
            ...user,
            firstPost: user.timestamps[0],
            lastPost: user.timestamps[user.timestamps.length - 1],
            avgLikes: user.postsCount > 0 ? Math.round(user.totalLikes / user.postsCount) : 0,
            avgComments: user.postsCount > 0 ? Math.round(user.totalComments / user.postsCount) : 0,
            avgInteraction: user.postsCount > 0 ? Math.round((user.totalLikes + user.totalComments) / user.postsCount) : 0
        };
    }).sort((a, b) => b.avgInteraction - a.avgInteraction);

    const visibleInstagramAccounts = allInstagramAccounts;

    // --- 3.5 Facebook Pages Analysis (NEW) ---
    const facebookPagesMap = new Map<string, any>();
    uniqueFbPosts.forEach(post => {
        if (!facebookPagesMap.has(post.username)) {
            facebookPagesMap.set(post.username, {
                username: post.username,
                postsCount: 0,
                totalLikes: 0,
                totalComments: 0,
                totalShares: 0,
                timestamps: []
            });
        }
        const page = facebookPagesMap.get(post.username);
        page.postsCount += 1;
        page.totalLikes += (post.likes || 0);
        page.totalComments += (post.comments || 0);
        page.totalShares += (post.shares || 0);
        if (post.parsedDate) page.timestamps.push(post.parsedDate);
    });

    const allFacebookPages = Array.from(facebookPagesMap.values()).map(page => {
        page.timestamps.sort((a: Date, b: Date) => a.getTime() - b.getTime());
        const totalInteractions = page.totalLikes + page.totalComments + page.totalShares;
        return {
            ...page,
            firstPost: page.timestamps[0],
            lastPost: page.timestamps[page.timestamps.length - 1],
            avgLikes: page.postsCount > 0 ? Math.round(page.totalLikes / page.postsCount) : 0,
            avgComments: page.postsCount > 0 ? Math.round(page.totalComments / page.postsCount) : 0,
            avgShares: page.postsCount > 0 ? Math.round(page.totalShares / page.postsCount) : 0,
            avgInteraction: page.postsCount > 0 ? Math.round(totalInteractions / page.postsCount) : 0
        };
    }).sort((a, b) => b.postsCount - a.postsCount); // Sort by activity volume


    // --- 4. Store Analysis ---
    const storesMap = new Map<string, any>();
    products.forEach(product => {
        const vendor = product.vendor || 'Unknown';
        if (!storesMap.has(vendor)) {
            storesMap.set(vendor, { vendor, totalProducts: 0, timestamps: [], newProducts30d: 0 });
        }
        const store = storesMap.get(vendor);
        store.totalProducts += 1;
        if (product.created_at) {
            const pDate = parseISO(product.created_at);
            store.timestamps.push(pDate);
            if (pDate >= thirtyDaysAgo) store.newProducts30d += 1;
        }
    });

    const topStores = Array.from(storesMap.values()).map(store => {
         store.timestamps.sort((a: Date, b: Date) => a.getTime() - b.getTime());
         const total = store.totalProducts;
         const firstAdded = store.timestamps[0];
         const lastAdded = store.timestamps[store.timestamps.length - 1];
         const daysActive = firstAdded && lastAdded ? Math.max(1, differenceInDays(lastAdded, firstAdded)) : 1;
         
         const calcPercent = (val: number) => total > 0 ? (val / total) * 100 : 0;

         return {
             vendor: store.vendor,
             totalProducts: total,
             newProducts30d: store.newProducts30d,
             newProducts30dPercentage: calcPercent(store.newProducts30d),
             activityRate30d: calcPercent(store.newProducts30d),
             avgDailyProducts: total > 0 ? (total / daysActive).toFixed(2) : "0.00",
             lastProductAdded: lastAdded ? format(lastAdded, 'yyyy-MM-dd') : 'N/A',
             firstProductAdded: firstAdded ? format(firstAdded, 'yyyy-MM-dd') : 'N/A'
         };
    }).sort((a, b) => b.totalProducts - a.totalProducts);

    // --- 5. Languages ---
    const languagesStats: Record<string, number> = {};
    products.forEach(p => { if (p.language) languagesStats[p.language] = (languagesStats[p.language] || 0) + 1; });
    const distinctLanguages = new Set(Object.keys(languagesStats));
    uniquePosts.forEach(p => {
        const lang = instagramLanguageMapping[p.username];
        if (lang) distinctLanguages.add(lang);
    });
    const totalLanguages = distinctLanguages.size;
    const topLanguages = Object.entries(languagesStats).map(([code, count]) => ({ code, count })).sort((a, b) => b.count - a.count).slice(0, 10);

    // --- 6. Keywords ---
    const stopWords = new Set(['the', 'and', 'for', 'with', 'new', 'free', 'from', 'size', 'color', 'black', 'white', 'blue', 'red', 'collection', 'style', 'fashion', 'men', 'women', 'kids']);
    const keywordMap = new Map<string, number>();
    products.forEach(p => {
        if (!p.name) return;
        const words = p.name.toLowerCase().replace(/[^\w\s]/gi, '').split(/\s+/);
        words.forEach(word => {
            if (word.length > 3 && !stopWords.has(word) && !/^\d+$/.test(word)) {
                keywordMap.set(word, (keywordMap.get(word) || 0) + 1);
            }
        });
    });
    const topKeywords = Array.from(keywordMap.entries()).map(([text, value]) => ({ text, value })).sort((a, b) => b.value - a.value).slice(0, 30);

    return {
        kpi: {
            totalProducts: products.length,
            totalPosts: uniquePosts.length,
            uniqueStores,
            uniqueInstagramUsers: allInstagramAccounts.length,
            newProducts30d,
            newPosts30d,
            productsGrowth: newProductsPrev30d > 0 ? ((newProducts30d - newProductsPrev30d) / newProductsPrev30d) * 100 : 0,
            postsGrowth: newPostsPrev30d > 0 ? ((newPosts30d - newPostsPrev30d) / newPostsPrev30d) * 100 : 0,
            totalLanguages
        },
        chartData,
        visibleInstagramAccounts,
        allInstagramAccounts,
        allFacebookPages, // Export this
        topStores,
        topLanguages,
        topKeywords
    };

  }, [products, posts, fbPosts]);
};
