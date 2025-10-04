import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { normalizeUrl } from '../utils/urlUtils';
import { Product, InstagramPost } from '../types';

type FavoriteItem = (Product & { type: 'product' }) | (InstagramPost & { type: 'instagram' });

interface FavoritesState {
  favoriteItems: Map<string, FavoriteItem>;
  toggleFavorite: (item: Product | InstagramPost, type: 'product' | 'instagram') => void;
  isFavorite: (id: string) => boolean;
}

const getItemId = (item: Product | InstagramPost, type: 'product' | 'instagram'): string => {
  if (type === 'product') {
    return normalizeUrl((item as Product).url);
  }
  return (item as InstagramPost).permalink;
};

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favoriteItems: new Map(),

      toggleFavorite: (item: Product | InstagramPost, type: 'product' | 'instagram') => {
        const id = getItemId(item, type);
        set((state) => {
          const newFavoriteItems = new Map(state.favoriteItems);
          if (newFavoriteItems.has(id)) {
            newFavoriteItems.delete(id);
          } else {
            newFavoriteItems.set(id, { ...item, type });
          }
          return { favoriteItems: newFavoriteItems };
        });
      },

      isFavorite: (id: string) => {
        const normalizedId = id.startsWith('http') ? normalizeUrl(id) : id;
        return get().favoriteItems.has(normalizedId);
      },
    }),
    {
      name: 'favorites-storage',
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const { state } = JSON.parse(str);
          return {
            state: {
              ...state,
              favoriteItems: new Map(state.favoriteItems),
            },
          };
        },
        setItem: (name, newValue) => {
          const str = JSON.stringify({
            state: {
              ...newValue.state,
              favoriteItems: Array.from(newValue.state.favoriteItems.entries()),
            },
          });
          localStorage.setItem(name, str);
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);
