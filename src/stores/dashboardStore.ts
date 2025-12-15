import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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
    newProducts180d: boolean;
    newProducts30dPercentage: boolean;
    newProducts60dPercentage: boolean;
    newProducts90dPercentage: boolean;
    newProducts180dPercentage: boolean;
    activityRate30d: boolean;
    activityRate60d: boolean;
    activityRate90d: boolean;
    activityRate180d: boolean;
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
        newProducts60d: false,
        newProducts90d: false,
        newProducts180d: false,
        newProducts30dPercentage: false,
        newProducts60dPercentage: false,
        newProducts90dPercentage: false,
        newProducts180dPercentage: false,
        activityRate30d: true,
        activityRate60d: false,
        activityRate90d: false,
        activityRate180d: false,
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
      name: 'dashboard-settings-v2', // Changed name to force reset for new features
      storage: createJSONStorage(() => localStorage),
    }
  )
);
