import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { normalizeUrl } from '../utils/urlUtils';

// Define the shape of a single favorite list
export interface FavoriteList {
  name: string;
  products: string[];
}

// Define the shape of the entire favorites data structure
export interface FavoritesData {
  [listId: string]: FavoriteList;
}

// Define the shape of the store's state
interface FavoritesState {
  favorites: FavoritesData;
  // --- Actions ---
  toggleFavorite: (productUrl: string) => void;
  importLists: (data: FavoritesData) => void;
  exportLists: () => FavoritesData;
  addList: (name: string) => void;
  removeList: (listId: string) => void;
  renameList: (listId: string, newName: string) => void;
}

// Create the Zustand store
export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      // --- Initial State ---
      favorites: {
        my_main_favorites: { name: 'My Favorites', products: [] },
      },

      // --- Action Implementations ---
      toggleFavorite: (productUrl) => {
        const normalized = normalizeUrl(productUrl);
        const { favorites } = get();
        const mainList = favorites.my_main_favorites;
        const isFavorite = mainList.products.includes(normalized);

        const updatedProducts = isFavorite
          ? mainList.products.filter((p) => p !== normalized)
          : [...mainList.products, normalized];
        
        set({
          favorites: {
            ...favorites,
            my_main_favorites: {
              ...mainList,
              products: updatedProducts,
            },
          },
        });
      },

      importLists: (data) => {
        const existingFavorites = get().favorites;
        const mergedFavorites = { ...existingFavorites };

        for (const listId in data) {
            const list = data[listId];
            const normalizedList = {
                ...list,
                products: list.products.map(normalizeUrl),
            };
            // Avoid overwriting existing lists with the same ID, or create a new unique ID
            const newId = mergedFavorites[listId] ? `imported_${listId}_${Date.now()}` : listId;
            mergedFavorites[newId] = normalizedList;
        }
        set({ favorites: mergedFavorites });
      },

      exportLists: () => {
        return get().favorites;
      },
      
      addList: (name) => {
        const newListId = `list_${Date.now()}`;
        set((state) => ({
            favorites: {
                ...state.favorites,
                [newListId]: { name, products: [] },
            },
        }));
      },

      removeList: (listId) => {
        if (listId === 'my_main_favorites') return;
        set((state) => {
            const newFavorites = { ...state.favorites };
            delete newFavorites[listId];
            return { favorites: newFavorites };
        });
      },

      renameList: (listId, newName) => {
        set((state) => {
            if (!state.favorites[listId]) return state;
            return {
                favorites: {
                    ...state.favorites,
                    [listId]: { ...state.favorites[listId], name: newName },
                },
            };
        });
      },
    }),
    {
      name: 'favorites-storage',
      storage: createJSONStorage(() => localStorage),
      version: 2, // Version bump for the new structure
      migrate: (persistedState: any, version) => {
        if (version < 2 && persistedState) {
          // If old state is just an array of URLs, wrap it in the new structure.
          if (Array.isArray(persistedState.favorites?.my_main_favorites?.products)) {
            return persistedState; // Already in a good enough format
          }
          // Handle very old formats if necessary, otherwise, return a default state
          return {
            favorites: { my_main_favorites: { name: 'My Favorites', products: [] } }
          };
        }
        return persistedState;
      },
    }
  )
);
