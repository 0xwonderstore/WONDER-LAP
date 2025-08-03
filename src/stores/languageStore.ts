import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Locale } from '../types';

interface LanguageState {
  language: Locale;
  setLanguage: (language: Locale) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'language-storage',
    }
  )
);
