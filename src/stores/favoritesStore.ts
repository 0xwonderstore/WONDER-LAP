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
      version: 0, // A base version for our simple store
      migrate: (persistedState: any, version: number) => {
        // This function handles any old state from local storage.
        // If the state doesn't look like our simple object, reset it.
        if (!persistedState || !persistedState.my_main_favorites) {
          return { favorites: initialState } as FavoritesState;
        }
        return persistedState as FavoritesState;
      },
    }
  )
);
