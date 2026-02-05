import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FacebookFilters {
  username: string | null;
  minLikes: number | null;
  minComments: number | null;
  minShares: number | null;
}

export interface FacebookPageStore {
  currentPage: number;
  postsPerPage: number;
  filters: FacebookFilters;
  sort: 'asc' | 'desc';
  sortBy: 'date' | 'likes' | 'comments' | 'shares';
  dateRange: { from: Date | undefined; to: Date | undefined };
  
  setCurrentPage: (page: number) => void;
  setPostsPerPage: (num: number) => void;
  setFilters: (filters: Partial<FacebookFilters>) => void;
  setSort: (sort: 'asc' | 'desc') => void;
  setSortBy: (sortBy: 'date' | 'likes' | 'comments' | 'shares') => void;
  setDateRange: (range: { from: Date | undefined; to: Date | undefined }) => void;
  reset: () => void;
}

export const useFacebookPageStore = create<FacebookPageStore>()(
  persist(
    (set) => ({
      currentPage: 1,
      postsPerPage: 24,
      filters: {
        username: null,
        minLikes: null,
        minComments: null,
        minShares: null,
      },
      sort: 'desc',
      sortBy: 'date',
      dateRange: { from: undefined, to: undefined },

      setCurrentPage: (page) => set({ currentPage: page }),
      setPostsPerPage: (num) => set({ postsPerPage: num, currentPage: 1 }),
      setFilters: (newFilters) => set((state) => ({ 
          filters: { ...state.filters, ...newFilters },
          currentPage: 1 
      })),
      setSort: (sort) => set({ sort }),
      setSortBy: (sortBy) => set({ sortBy }),
      setDateRange: (range) => set({ dateRange: range, currentPage: 1 }),
      reset: () => set({
        currentPage: 1,
        filters: { username: null, minLikes: null, minComments: null, minShares: null },
        sort: 'desc',
        sortBy: 'date',
        dateRange: { from: undefined, to: undefined }
      }),
    }),
    { name: 'facebook-page-store' }
  )
);
