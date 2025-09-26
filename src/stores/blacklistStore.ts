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
  blockedStores: string[]; // This will now store normalized hostnames
  addKeyword: (keyword: string) => void;
  removeKeyword: (keyword: string) => void;
  addStore: (storeUrl: string) => void;
  removeStore: (storeUrl: string) => void;
}

export const useBlacklistStore = create<BlacklistState>()(
  persist(
    (set) => ({
      keywords: [],
      blockedStores: [],
      addKeyword: (keyword) =>
        set((state) => ({
          keywords: Array.from(new Set([...state.keywords, keyword.toLowerCase().trim()])),
        })),
      removeKeyword: (keyword) =>
        set((state) => ({
          keywords: state.keywords.filter((k) => k !== keyword),
        })),
      addStore: (storeUrl) => {
        const normalized = normalizeHostname(storeUrl);
        if (normalized) {
          set((state) => ({
            blockedStores: Array.from(new Set([...state.blockedStores, normalized])),
          }));
        }
      },
      removeStore: (storeUrl) => {
        // Note: The URL passed for removal might not be normalized if it's coming directly from the UI list.
        // We normalize it before filtering to ensure we remove the correct entry.
        const normalized = normalizeHostname(storeUrl);
        set((state) => ({
          blockedStores: state.blockedStores.filter((hostname) => hostname !== normalized),
        }));
      },
    }),
    {
      name: 'blacklist-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
