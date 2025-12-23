import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DateRange } from 'react-day-picker';

interface TikTokPageState {
  currentPage: number;
  filters: {
    username: string;
    minPlayCount: number | null;
    minDiggCount: number | null; // Likes
    minCommentCount: number | null;
    minShareCount: number | null;
    minCollectCount: number | null;
    isAd: boolean | null; // null for all, true for ads only, false for organic
  };
  dateRange: DateRange | undefined;
  sort: 'asc' | 'desc' | null;
  sortBy: 'playCount' | 'diggCount' | 'commentCount' | 'shareCount' | 'collectCount';
  
  setCurrentPage: (page: number) => void;
  setFilters: (newFilters: Partial<TikTokPageState['filters']>) => void;
  setDateRange: (dateRange: DateRange | undefined) => void;
  setSort: (sort: 'asc' | 'desc' | null) => void;
  setSortBy: (sortBy: TikTokPageState['sortBy']) => void;
  reset: () => void;
}

const initialState = {
  currentPage: 1,
  filters: {
    username: "",
    minPlayCount: null,
    minDiggCount: null,
    minCommentCount: null,
    minShareCount: null,
    minCollectCount: null,
    isAd: null,
  },
  dateRange: undefined,
  sort: null,
  sortBy: 'diggCount' as const, // Default sort by likes
};

export const useTikTokPageStore = create<TikTokPageState>()(
  persist(
    (set) => ({
      ...initialState,
      setCurrentPage: (page) => set({ currentPage: page }),
      setFilters: (newFilters) => set((state) => ({ filters: { ...state.filters, ...newFilters } })),
      setDateRange: (dateRange) => set({ dateRange }),
      setSort: (sort) => set({ sort }),
      setSortBy: (sortBy) => set({ sortBy }),
      reset: () => set(initialState),
    }),
    {
      name: 'tiktok-page-storage',
      partialize: (state) => {
        const { dateRange, ...rest } = state;
        return rest;
      },
    }
  )
);
