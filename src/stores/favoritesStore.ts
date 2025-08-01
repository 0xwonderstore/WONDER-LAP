import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { normalizeUrl } from '../utils/urlUtils';

export interface FavoriteList {
  name: string;
  products: string[];
}

export interface FavoritesData {
  [listId: string]: FavoriteList;
}

interface FavoritesState {
  favorites: FavoritesData;
  actions: {
    toggleFavorite: (productUrl: string) => void;
    assignProductToLists: (productUrl: string, listIds: string[]) => void;
    addList: (name: string) => void;
    removeList: (listId: string) => void;
    renameList: (listId: string, newName: string) => void;
  }
}

const initialState = {
    my_main_favorites: { name: 'My Favorites', products: [] },
};

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set) => ({
      favorites: initialState,
      actions: {
        toggleFavorite: (productUrl) => set((state) => {
          const normalized = normalizeUrl(productUrl);
          const mainList = state.favorites.my_main_favorites;
          const products = new Set(mainList.products);
          products.has(normalized) ? products.delete(normalized) : products.add(normalized);
          return {
            favorites: { ...state.favorites, my_main_favorites: { ...mainList, products: Array.from(products) } }
          };
        }),
        
        assignProductToLists: (productUrl, targetListIds) => set((state) => {
            const normalized = normalizeUrl(productUrl);
            const newFavorites = JSON.parse(JSON.stringify(state.favorites));
            
            Object.keys(newFavorites).forEach(listId => {
                const productSet = new Set(newFavorites[listId].products);
                if (targetListIds.includes(listId)) {
                    productSet.add(normalized); // Add to target lists
                } else {
                    if (listId !== 'my_main_favorites') { // Never remove from main list via this action
                        productSet.delete(normalized);
                    }
                }
                newFavorites[listId].products = Array.from(productSet);
            });

            return { favorites: newFavorites };
        }),

        addList: (name) => set((state) => ({
          favorites: { ...state.favorites, [`list_${Date.now()}`]: { name, products: [] } }
        })),

        removeList: (listId) => set((state) => {
          if (listId === 'my_main_favorites') return state;
          const newFavorites = { ...state.favorites };
          delete newFavorites[listId];
          return { favorites: newFavorites };
        }),

        renameList: (listId, newName) => set((state) => {
          if (!state.favorites[listId] || listId === 'my_main_favorites') return state;
          const newFavorites = { ...state.favorites };
          newFavorites[listId] = { ...newFavorites[listId], name: newName };
          return { favorites: newFavorites };
        }),
      }
    }),
    {
      name: 'favorites-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ favorites: state.favorites }),
    }
  )
);
