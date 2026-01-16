import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface InstagramBlacklistState {
  blacklistedUsers: Set<string>;
  blacklistedPosts: Set<string>;
  addUser: (username: string) => void;
  removeUser: (username: string) => void;
  addPost: (permalink: string) => void;
  removePost: (permalink: string) => void;
  addPosts: (permalinks: string[]) => void;
  clearBlacklistedPosts: () => void;
}

export const useInstagramBlacklistStore = create<InstagramBlacklistState>()(
  persist(
    (set) => ({
      blacklistedUsers: new Set(),
      blacklistedPosts: new Set(),
      addUser: (username) =>
        set((state) => ({
          blacklistedUsers: new Set(state.blacklistedUsers).add(username),
        })),
      removeUser: (username) =>
        set((state) => {
          const newSet = new Set(state.blacklistedUsers);
          newSet.delete(username);
          return { blacklistedUsers: newSet };
        }),
      addPost: (permalink) =>
        set((state) => ({
          blacklistedPosts: new Set(state.blacklistedPosts).add(permalink),
        })),
      removePost: (permalink) =>
        set((state) => {
          const newSet = new Set(state.blacklistedPosts);
          newSet.delete(permalink);
          return { blacklistedPosts: newSet };
        }),
      addPosts: (permalinks) =>
        set((state) => {
          const newSet = new Set(state.blacklistedPosts);
          permalinks.forEach(p => newSet.add(p));
          return { blacklistedPosts: newSet };
        }),
      clearBlacklistedPosts: () => set({ blacklistedPosts: new Set() }),
    }),
    {
      name: 'instagram-blacklist-storage-v2',
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          try {
            const { state } = JSON.parse(str);
            return {
              state: {
                ...state,
                blacklistedUsers: new Set(state.blacklistedUsers || []),
                blacklistedPosts: new Set(state.blacklistedPosts || []),
              },
            };
          } catch (e) {
            return null;
          }
        },
        setItem: (name, newValue) => {
          const str = JSON.stringify({
            state: {
              ...newValue.state,
              blacklistedUsers: Array.from(newValue.state.blacklistedUsers),
              blacklistedPosts: Array.from(newValue.state.blacklistedPosts),
            },
          });
          localStorage.setItem(name, str);
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);
