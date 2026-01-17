import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface BlacklistState {
  keywords: string[];
  blockedStores: string[];
  hiddenProducts: string[]; // List of product URLs
  addKeyword: (keyword: string) => void;
  removeKeyword: (keyword: string) => void;
  addStore: (store: string) => void;
  removeStore: (store: string) => void;
  hideProduct: (url: string) => void;
  hideProducts: (urls: string[]) => void;
  unhideProduct: (url: string) => void;
  clearHiddenProducts: () => void;
  exportBlacklist: () => string;
  importBlacklist: (json: string) => number;
}

export const useBlacklistStore = create<BlacklistState>()(
  persist(
    (set, get) => ({
      keywords: [],
      blockedStores: [],
      hiddenProducts: [],
      addKeyword: (keyword) =>
        set((state) => ({
          keywords: state.keywords.includes(keyword)
            ? state.keywords
            : [...state.keywords, keyword],
        })),
      removeKeyword: (keyword) =>
        set((state) => ({
          keywords: state.keywords.filter((k) => k !== keyword),
        })),
      addStore: (store) =>
        set((state) => ({
          blockedStores: state.blockedStores.includes(store)
            ? state.blockedStores
            : [...state.blockedStores, store],
        })),
      removeStore: (store) =>
        set((state) => ({
          blockedStores: state.blockedStores.filter((s) => s !== store),
        })),
      hideProduct: (url) =>
        set((state) => ({
          hiddenProducts: state.hiddenProducts.includes(url)
            ? state.hiddenProducts
            : [...state.hiddenProducts, url],
        })),
      hideProducts: (urls) =>
        set((state) => {
            const currentSet = new Set(state.hiddenProducts);
            urls.forEach(url => currentSet.add(url));
            return { hiddenProducts: Array.from(currentSet) };
        }),
      unhideProduct: (url) =>
        set((state) => ({
          hiddenProducts: state.hiddenProducts.filter((u) => u !== url),
        })),
      clearHiddenProducts: () => set({ hiddenProducts: [] }),
      
      exportBlacklist: () => {
        const state = get();
        return JSON.stringify({
            hiddenProducts: state.hiddenProducts,
            // We can export keywords/stores too if needed, but requested focus is on hidden items list
            // keywords: state.keywords,
            // blockedStores: state.blockedStores
        }, null, 2);
      },
      
      importBlacklist: (json) => {
        try {
            const data = JSON.parse(json);
            if (Array.isArray(data.hiddenProducts)) {
                set((state) => {
                    const newSet = new Set(state.hiddenProducts);
                    data.hiddenProducts.forEach((url: string) => newSet.add(url));
                    return { hiddenProducts: Array.from(newSet) };
                });
                return data.hiddenProducts.length;
            }
            return 0;
        } catch (e) {
            console.error("Import failed", e);
            return 0;
        }
      }
    }),
    {
      name: 'blacklist-storage',
    }
  )
);
