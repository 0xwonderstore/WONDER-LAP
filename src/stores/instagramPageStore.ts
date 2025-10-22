import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DateRange } from 'react-day-picker';

interface InstagramPageState {
  currentPage: number;
  filters: {
    username: string;
    minLikes: number | null;
    maxLikes: number | null;
    language: string;
  };
  dateRange: DateRange | undefined;
  sort: 'asc' | 'desc' | null;
  setCurrentPage: (page: number) => void;
  setFilters: (newFilters: Partial<InstagramPageState['filters']>) => void;
  setDateRange: (dateRange: DateRange | undefined) => void;
  setSort: (sort: 'asc' | 'desc' | null) => void;
  reset: () => void;
}

const initialState = {
  currentPage: 1,
  filters: {
    username: "",
    minLikes: null,
    maxLikes: null,
    language: "",
  },
  dateRange: undefined,
  sort: null,
};

export const useInstagramPageStore = create<InstagramPageState>()(
  persist(
    (set) => ({
      ...initialState,
      setCurrentPage: (page) => set({ currentPage: page }),
      setFilters: (newFilters) => set((state) => ({ filters: { ...state.filters, ...newFilters } })),
      setDateRange: (dateRange) => set({ dateRange }),
      setSort: (sort) => set({ sort }),
      reset: () => set(initialState),
    }),
    {
      name: 'instagram-page-storage',
    }
  )
);