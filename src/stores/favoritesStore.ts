import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Define the shape of a single favorite list
interface FavoriteList {
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
  addList: (id: string, name: string, products: string[]) => void;
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
        const { favorites } = get();
        const mainList = favorites.my_main_favorites;
        const isFavorite = mainList.products.includes(productUrl);

        // Create a new array for the updated list
        const updatedProducts = isFavorite
          ? mainList.products.filter((p) => p !== productUrl)
          : [...mainList.products, productUrl];
        
        // Update the state immutably
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

      addList: (id, name, products) => {
        set((state) => ({
          favorites: {
            ...state.favorites,
            [id]: { name, products },
          },
        }));
      },

      removeList: (listId) => {
        if (listId === 'my_main_favorites') return; // Safety check
        const { favorites } = get();
        // Create a new object without the deleted list
        const newFavorites = { ...favorites };
        delete newFavorites[listId];
        set({ favorites: newFavorites });
      },

      renameList: (listId, newName) => {
        const { favorites } = get();
        if (!favorites[listId]) return; // Safety check
        
        // Update the list name immutably
        set({
          favorites: {
            ...favorites,
            [listId]: {
              ...favorites[listId],
              name: newName,
            },
          },
        });
      },
    }),
    {
      // --- Persistence Configuration ---
      name: 'favorites-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    }
  )
);
