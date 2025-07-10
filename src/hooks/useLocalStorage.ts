import { useState, useEffect } from 'react';

/**
 * A custom hook that syncs a state value with localStorage.
 *
 * @param key The key to use in localStorage.
 * @param defaultValue The initial value to use if nothing is in localStorage.
 * @returns A stateful value, and a function to update it.
 */
export function useLocalStorage<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  
  const getStoredValue = (): T => {
    // During server-side rendering, window is not available.
    if (typeof window === 'undefined') {
      return defaultValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading localStorage key “${key}”:`, error);
      return defaultValue;
    }
  };

  const [value, setValue] = useState<T>(getStoredValue);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error(`Error writing to localStorage key “${key}”:`, error);
      }
    }
  }, [key, value]);

  return [value, setValue];
}
