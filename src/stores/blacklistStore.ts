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
    }),
    {
      name: 'blacklist-storage-v2', // Using a new name to avoid conflicts with old data
      storage: createJSONStorage(() => localStorage),
    }
  )
);
