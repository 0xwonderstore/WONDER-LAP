import { useState, useEffect, useCallback } from 'react';

const FAVORITES_KEY = 'wonder_lab_favorites';

/**
 * A helper function to get the initial state from localStorage.
 * This runs only once when the component is first mounted.
 */
const getInitialFavorites = (): Set<string> => {
  try {
    const storedFavorites = window.localStorage.getItem(FAVORITES_KEY);
    if (storedFavorites) {
      // Parse the stored JSON and create a Set from the array
      return new Set(JSON.parse(storedFavorites));
    }
  } catch (error) {
    console.error('Error reading favorites from localStorage:', error);
  }
  // Return an empty set if nothing is stored or an error occurs
  return new Set();
};


/**
 * Custom hook to manage a list of favorite products stored in localStorage.
 * @returns A tuple containing:
 *  - A Set of favorite product URLs.
 *  - A function to toggle a product's favorite status.
 */
export function useFavorites(): [Set<string>, (productUrl: string) => void] {
  // Initialize state lazily from localStorage
  const [favorites, setFavorites] = useState<Set<string>>(getInitialFavorites);

  // This effect now only runs when the 'favorites' state changes,
  // saving the updated list to localStorage.
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
