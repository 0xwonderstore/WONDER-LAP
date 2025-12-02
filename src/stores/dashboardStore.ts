import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DashboardState {
  tabVisibility: {
    stores: boolean;
    keywords: boolean;
    languages: boolean;
  };
  storeColumnsVisibility: {
    totalProducts: boolean;
    language: boolean;
    newProducts30d: boolean;
    newProducts60d: boolean;
    newProducts90d: boolean;
    lastProductAdded: boolean;
    firstProductAdded: boolean;
    metaAdLibrary: boolean;
  };
  toggleTabVisibility: (tab: 'stores' | 'keywords' | 'languages') => void;
  toggleStoreColumnVisibility: (column: keyof DashboardState['storeColumnsVisibility']) => void;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      tabVisibility: {
        stores: true,
        keywords: true,
        languages: true,
      },
      storeColumnsVisibility: {
        totalProducts: true,
        language: true,
        newProducts30d: true,
        newProducts60d: false, // Default hidden
        newProducts90d: false, // Default hidden
        lastProductAdded: true,
        firstProductAdded: true,
        metaAdLibrary: true,
      },
      toggleTabVisibility: (tab) =>
        set((state) => ({
          tabVisibility: {
            ...state.tabVisibility,
            [tab]: !state.tabVisibility[tab],
          },
        })),
      toggleStoreColumnVisibility: (column) =>
        set((state) => ({
          storeColumnsVisibility: {
            ...state.storeColumnsVisibility,
            [column]: !state.storeColumnsVisibility[column],
          },
        })),
    }),
    {
      name: 'dashboard-settings',
    }
  )
);
