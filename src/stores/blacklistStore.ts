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
}

export const useBlacklistStore = create<BlacklistState>()(
  persist(
    (set) => ({
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
    }),
    {
      name: 'blacklist-storage',
    }
  )
);
