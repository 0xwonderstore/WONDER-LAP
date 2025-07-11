import { useState, useEffect, useCallback } from 'react';

const FAVORITES_KEY = 'wonder_lab_favorites';

/**
 * A helper function to get the initial state from localStorage synchronously.
 * This runs only once when the hook is first called.
 */
const getInitialFavorites = (): Set<string> => {
  try {
    const item = window.localStorage.getItem(FAVORITES_KEY);
    // If an item is found, parse it and create a Set, otherwise return an empty Set.
    return item ? new Set(JSON.parse(item)) : new Set();
  } catch (error) {
    console.error('Error reading favorites from localStorage:', error);
    // If there's an error, default to an empty set for safety.
    return new Set();
  }
};

/**
 * Custom hook to manage a list of favorite products stored in localStorage.
 * This version safely initializes state from localStorage on the first render.
 * @returns A tuple containing:
 *  - A Set of favorite product URLs.
 *  - A function to toggle a product's favorite status.
 */
export function useFavorites(): [Set<string>, (productUrl: string) => void] {
  // Initialize state lazily and synchronously from localStorage.
  const [favorites, setFavorites] = useState<Set<string>>(getInitialFavorites);

  // This effect runs ONLY when the 'favorites' state changes, saving the new version.
  useEffect(() => {
    try {
      window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(favorites)));
    } catch (error) {
      console.error('Error writing favorites to localStorage:', error);
    }
  }, [favorites]);

  const toggleFavorite = useCallback((productUrl: string) => {
    setFavorites(prevFavorites => {
      const newFavorites = new Set(prevFavorites);
      if (newFavorites.has(productUrl)) {
        newFavorites.delete(productUrl);
      } else {
        newFavorites.add(productUrl);
      }
      return newFavorites;
    });
  }, []);

  return [favorites, toggleFavorite];
}
