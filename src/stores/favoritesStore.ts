import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { normalizeUrl } from '../utils/urlUtils';

export interface FavoritesData {
  my_main_favorites: {
    name: string;
    products: string[];
  };
}

interface FavoritesState {
  favorites: FavoritesData;
  toggleFavorite: (productUrl: string) => void;
}

const initialState = {
    my_main_favorites: { name: 'My Favorites', products: [] },
};

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set) => ({
      favorites: initialState,
      toggleFavorite: (productUrl) => set((state) => {
        const normalized = normalizeUrl(productUrl);
        const products = new Set(state.favorites.my_main_favorites.products);

        if (products.has(normalized)) {
          products.delete(normalized);
        } else {
          products.add(normalized);
        }

        return {
          favorites: {
            ...state.favorites,
            my_main_favorites: {
              ...state.favorites.my_main_favorites,
              products: Array.from(products),
            },
          },
        };
      }),
    }),
    {
      name: 'favorites-storage',
      storage: createJSONStorage(() => localStorage),
      version: 0, // A base version for our simple state
      migrate: (persistedState: any, version: number) => {
        // This function handles loading old data.
        // If the data is from a complex version or is broken, we reset it.
        if (persistedState && persistedState.actions) {
          console.log("Old state detected, resetting to a simpler format.");
          return { favorites: initialState, toggleFavorite: (initialState as any).toggleFavorite };
        }
        // If the state looks simple enough, we use it.
        return persistedState;
      },
    }
  )
);
