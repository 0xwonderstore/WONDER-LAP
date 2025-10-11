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
  brokenImageUrls: Set<string>; // <-- To track products with broken images
  addKeyword: (keyword: string) => void;
  removeKeyword: (keyword: string) => void;
  addStore: (storeUrl: string) => void;
  removeStore: (storeUrl: string) => void;
  addBrokenImageUrl: (url: string) => void; // <-- New action
}

export const useBlacklistStore = create<BlacklistState>()(
  persist(
    (set) => ({
      keywords: [],
      blockedStores: [],
      brokenImageUrls: new Set(), // <-- Initialize as a Set for efficiency
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
      addBrokenImageUrl: (url) => {
        if (url) {
          set((state) => {
            const newBrokenUrls = new Set(state.brokenImageUrls);
            newBrokenUrls.add(url);
            return { brokenImageUrls: newBrokenUrls };
          });
        }
      },
    }),
    {
      name: 'blacklist-storage-v3', // <-- Incremented version for new structure
      storage: createJSONStorage(() => localStorage, {
        // Custom replacer/reviver to handle Set serialization
        replacer: (key, value) => (value instanceof Set ? Array.from(value) : value),
        reviver: (key, value) => (key === 'brokenImageUrls' ? new Set(value) : value),
      }),
    }
  )
);
