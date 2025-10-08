import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { normalizeUrl } from '../utils/urlUtils';

// A simpler, more direct state shape.
interface FavoritesState {
  // Using a Set for efficient add/delete/has operations.
  favoriteUrls: Set<string>;
  toggleFavorite: (productUrl: string) => void;
  isFavorite: (productUrl: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favoriteUrls: new Set(),

      toggleFavorite: (productUrl: string) => {
        const normalized = normalizeUrl(productUrl);
        set((state) => {
          const newFavoriteUrls = new Set(state.favoriteUrls);
          if (newFavoriteUrls.has(normalized)) {
            newFavoriteUrls.delete(normalized);
          } else {
            newFavoriteUrls.add(normalized);
          }
          return { favoriteUrls: newFavoriteUrls };
        });
      },

      isFavorite: (productUrl: string) => {
        const normalized = normalizeUrl(productUrl);
        return get().favoriteUrls.has(normalized);
      },
    }),
    {
      name: 'favorites-storage',
      // Custom serializer for storing a Set in localStorage
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const { state } = JSON.parse(str);
          return {
            state: {
              ...state,
              favoriteUrls: new Set(state.favoriteUrls),
            },
          };
        },
        setItem: (name, newValue) => {
          // Convert Set to array before storing
          const str = JSON.stringify({
            state: {
              ...newValue.state,
              favoriteUrls: Array.from(newValue.state.favoriteUrls),
            },
          });
          localStorage.setItem(name, str);
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);
