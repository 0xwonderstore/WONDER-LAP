import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Helper function to normalize a URL to its core hostname
const normalizeHostname = (url: string): string => {
  if (!url) return '';
  // Strips protocol, 'www.' prefix, and any path. Converts to lowercase.
  return url.trim().toLowerCase().replace(/^(?:https?|ftp):\/\//, '').replace(/^(?:www\.)?/, '').split('/')[0];
};

interface BlacklistState {
  keywords: string[];
  blockedStores: string[]; // This will store normalized hostnames
  hiddenProducts: string[]; // Store product unique identifiers (IDs or URLs)
  addKeyword: (keyword: string) => void;
  removeKeyword: (keyword: string) => void;
  addStore: (storeUrl: string) => void;
  removeStore: (storeUrl: string) => void;
  hideProduct: (productId: string) => void;
  unhideProduct: (productId: string) => void;
  hideProducts: (productIds: string[]) => void;
  clearHiddenProducts: () => void;
}

export const useBlacklistStore = create<BlacklistState>()(
  persist(
    (set) => ({
      keywords: [],
      blockedStores: [],
      hiddenProducts: [],
      addKeyword: (keyword) => {
        const cleanedKeyword = keyword.toLowerCase().trim();
        if (cleanedKeyword) {
          set((state) => ({
            keywords: [...new Set([...state.keywords, cleanedKeyword])],
          }));
        }
      },
      removeKeyword: (keyword) =>
        set((state) => ({
          keywords: state.keywords.filter((k) => k !== keyword.toLowerCase().trim()),
        })),
      addStore: (storeUrl) => {
        const normalized = normalizeHostname(storeUrl);
        if (normalized) {
          set((state) => ({
            blockedStores: [...new Set([...state.blockedStores, normalized])],
          }));
        }
      },
      removeStore: (storeUrl) => {
        const normalized = normalizeHostname(storeUrl);
        set((state) => ({
          blockedStores: state.blockedStores.filter((hostname) => hostname !== normalized),
        }));
      },
      hideProduct: (productId) => set((state) => ({
        hiddenProducts: [...new Set([...state.hiddenProducts, productId])]
      })),
      unhideProduct: (productId) => set((state) => ({
        hiddenProducts: state.hiddenProducts.filter(id => id !== productId)
      })),
      hideProducts: (productIds) => set((state) => ({
        hiddenProducts: [...new Set([...state.hiddenProducts, ...productIds])]
      })),
      clearHiddenProducts: () => set({ hiddenProducts: [] }),
    }),
    {
      name: 'blacklist-storage-v3', // Incremented version
      storage: createJSONStorage(() => localStorage),
    }
  )
);
