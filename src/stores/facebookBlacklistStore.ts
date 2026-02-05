import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FacebookBlacklistState {
  blacklistedUsers: Set<string>;
  blacklistedPosts: Set<string>;
  addUser: (username: string) => void;
  removeUser: (username: string) => void;
  addPost: (permalink: string) => void;
  removePost: (permalink: string) => void;
  addPosts: (permalinks: string[]) => void;
  clearBlacklistedPosts: () => void;
  exportFacebookBlacklistToCSV: () => string;
  importFacebookBlacklist: (input: string) => number;
}

export const useFacebookBlacklistStore = create<FacebookBlacklistState>()(
  persist(
    (set, get) => ({
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
          permalinks.forEach(p => {
              if (p && p.trim().length > 0) newSet.add(p.trim());
          });
          return { blacklistedPosts: newSet };
        }),
      clearBlacklistedPosts: () => set({ blacklistedPosts: new Set() }),
      
      exportFacebookBlacklistToCSV: () => {
          const state = get();
          const header = "Facebook Post URL\n";
          const rows = Array.from(state.blacklistedPosts).map(url => `"${url.replace(/"/g, '""')}"`).join("\n");
          return header + rows;
      },
      
      importFacebookBlacklist: (input) => {
          try {
              let urlsToAdd: string[] = [];
              try {
                  if (input.trim().startsWith('{') || input.trim().startsWith('[')) {
                    const data = JSON.parse(input);
                    if (Array.isArray(data.blacklistedPosts)) {
                        urlsToAdd = data.blacklistedPosts;
                    } else if (Array.isArray(data)) {
                        urlsToAdd = data;
                    }
                  } else {
                      throw new Error("Not JSON");
                  }
              } catch (e) {
                  const lines = input.split('\n');
                  urlsToAdd = lines.map(line => {
                      let cleanLine = line.trim();
                      if (cleanLine.startsWith('"') && cleanLine.endsWith('"')) {
                          cleanLine = cleanLine.substring(1, cleanLine.length - 1).replace(/""/g, '"');
                      }
                      if (cleanLine.toLowerCase() === 'facebook post url' || cleanLine.toLowerCase() === 'post url') return '';
                      return cleanLine;
                  }).filter(l => l.length > 0);
              }

              if (urlsToAdd.length > 0) {
                  set((state) => {
                      const newSet = new Set(state.blacklistedPosts);
                      urlsToAdd.forEach((url: string) => {
                          if (typeof url === 'string' && url.length > 0) newSet.add(url.trim());
                      });
                      return { blacklistedPosts: newSet };
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
      name: 'facebook-blacklist-storage',
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
