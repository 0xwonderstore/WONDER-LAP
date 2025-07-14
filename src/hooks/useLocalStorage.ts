
import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage<T>(key: string, defaultValue: T): [T, (value: T | ((prev: T) => T)) => void] {
    const [value, setValue] = useState<T>(() => {
        if (typeof window === 'undefined') {
            return defaultValue;
        }
        try {
            const item = window.localStorage.getItem(key);
            if (!item) {
                return defaultValue;
            }
            const storedValue = JSON.parse(item);
            // Merge stored value with default value to ensure all keys are present
            if (typeof defaultValue === 'object' && defaultValue !== null && !Array.isArray(defaultValue)) {
                return { ...defaultValue, ...storedValue };
            }
            return storedValue;
        } catch (error) {
            console.error(error);
            return defaultValue;
        }
    });

    const setStoredValue = useCallback((valueToSet: T | ((prev: T) => T)) => {
        try {
            const valueToStore = valueToSet instanceof Function ? valueToSet(value) : valueToSet;
            setValue(valueToStore);
            if (typeof window !== 'undefined') {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }
        } catch (error) {
            console.error(error);
        }
    }, [key, value]);

    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === key && e.newValue) {
                try {
                    setValue(JSON.parse(e.newValue));
                } catch (error) {
                    console.error(error);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [key]);

    return [value, setStoredValue];
}
