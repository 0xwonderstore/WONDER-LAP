import { create } from 'zustand';
import { InstagramPost } from '../types';
import { fetchLivePostsForUsers } from '../utils/liveInstagramFetcher';

type SortOption = 'likes-desc' | 'likes-asc' | 'comments-desc' | 'comments-asc' | 'date-desc' | 'date-asc';

interface LiveInstagramState {
  trackedUsers: string[];
  posts: InstagramPost[];
  isLoading: boolean;
  isLoadingMore: boolean;
  sortOption: SortOption;
  page: number;
  hasMore: boolean;
  
  // Actions
  addUser: (username: string) => void;
  removeUser: (username: string) => void;
  fetchPosts: (isLoadMore?: boolean) => Promise<void>;
  setSortOption: (option: SortOption) => void;
  clearAll: () => void;
}

export const useLiveInstagramStore = create<LiveInstagramState>((set, get) => ({
  trackedUsers: [],
  posts: [],
  isLoading: false,
  isLoadingMore: false,
  sortOption: 'date-desc',
  page: 1,
  hasMore: true,

  addUser: (username) => {
    const currentUsers = get().trackedUsers;
    if (!currentUsers.includes(username)) {
      set({ trackedUsers: [...currentUsers, username], page: 1, posts: [] }); 
      // Reset posts and fetch fresh when a new user is added to ensure consistency
      get().fetchPosts(false);
    }
  },

  removeUser: (username) => {
    const currentUsers = get().trackedUsers;
    const newUsers = currentUsers.filter(u => u !== username);
    set({ 
        trackedUsers: newUsers,
        // Remove posts belonging to this user
        posts: get().posts.filter(p => p.username !== username)
    });
  },

  clearAll: () => {
      set({ trackedUsers: [], posts: [], page: 1, hasMore: true });
  },

  setSortOption: (option) => {
      set({ sortOption: option });
  },

  fetchPosts: async (isLoadMore = false) => {
    const { trackedUsers, page, posts } = get();
    if (trackedUsers.length === 0) return;

    if (isLoadMore) {
        set({ isLoadingMore: true });
    } else {
        set({ isLoading: true, page: 1, hasMore: true });
    }

    try {
        const currentPage = isLoadMore ? page + 1 : 1;
        
        // Fetch 20 posts per page
        const newPosts = await fetchLivePostsForUsers(trackedUsers, currentPage, 20);
        
        // Logic to determine if there are more posts (simulated)
        const hasMoreData = newPosts.length > 0;

        set((state) => ({
            posts: isLoadMore ? [...state.posts, ...newPosts] : newPosts,
            page: currentPage,
            hasMore: hasMoreData,
        }));
    } catch (error) {
        console.error("Failed to fetch live posts", error);
    } finally {
        set({ isLoading: false, isLoadingMore: false });
    }
  }
}));
