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
  exportBlacklistToCSV: () => string;
  importBlacklist: (input: string) => number;
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
            urls.forEach(url => {
                if (url && url.trim().length > 0) currentSet.add(url.trim());
            });
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
        }, null, 2);
      },

      exportBlacklistToCSV: () => {
          const state = get();
          // Add BOM for Excel to recognize UTF-8, though URLs usually ASCII
          // Simple CSV: Header row, then data
          const header = "Product URL\n";
          const rows = state.hiddenProducts.map(url => `"${url.replace(/"/g, '""')}"`).join("\n");
          return header + rows;
      },
      
      importBlacklist: (input: string) => {
        try {
            let urlsToAdd: string[] = [];

            // Attempt to parse as JSON first (backward compatibility)
            try {
                if (input.trim().startsWith('{') || input.trim().startsWith('[')) {
                    const data = JSON.parse(input);
                    if (Array.isArray(data.hiddenProducts)) {
                        urlsToAdd = data.hiddenProducts;
                    } else if (Array.isArray(data)) {
                        urlsToAdd = data;
                    }
                } else {
                    throw new Error("Not JSON");
                }
            } catch (jsonError) {
                // Treat as CSV / Text
                // Split by newline
                const lines = input.split('\n');
                urlsToAdd = lines.map(line => {
                    // Remove quotes if present from CSV format
                    let cleanLine = line.trim();
                    if (cleanLine.startsWith('"') && cleanLine.endsWith('"')) {
                        cleanLine = cleanLine.substring(1, cleanLine.length - 1).replace(/""/g, '"');
                    }
                    // Skip header if it matches known header
                    if (cleanLine.toLowerCase() === 'product url') return '';
                    return cleanLine;
                }).filter(l => l.length > 0);
            }

            if (urlsToAdd.length > 0) {
                set((state) => {
                    const newSet = new Set(state.hiddenProducts);
                    urlsToAdd.forEach((url: string) => {
                        if (typeof url === 'string' && url.length > 0) newSet.add(url.trim());
                    });
                    return { hiddenProducts: Array.from(newSet) };
                });
                return urlsToAdd.length;
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
