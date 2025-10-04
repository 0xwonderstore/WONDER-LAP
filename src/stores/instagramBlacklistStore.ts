import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface InstagramBlacklistState {
  blacklistedUsers: Set<string>;
  addUser: (username: string) => void;
  removeUser: (username: string) => void;
}

export const useInstagramBlacklistStore = create<InstagramBlacklistState>()(
  persist(
    (set) => ({
      blacklistedUsers: new Set(),
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
    }),
    {
      name: 'instagram-blacklist-storage',
      // Custom serializer to handle Set
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const { state } = JSON.parse(str);
          return {
            state: {
              ...state,
              blacklistedUsers: new Set(state.blacklistedUsers),
            },
          };
        },
        setItem: (name, newValue) => {
          const str = JSON.stringify({
            state: {
              ...newValue.state,
              blacklistedUsers: Array.from(newValue.state.blacklistedUsers),
            },
          });
          localStorage.setItem(name, str);
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);
