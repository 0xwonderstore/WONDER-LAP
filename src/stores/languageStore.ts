import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { translations } from '../translations';

type Language = 'en' | 'ar';

interface LanguageState {
  language: Language;
  translations: any;
  setLanguage: (language: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'ar',
      translations: translations.ar,
      setLanguage: (language) => set({ language, translations: translations[language] }),
    }),
    {
      name: 'language-storage', // name of the item in the storage (must be unique)
      getStorage: () => localStorage, // (optional) by default, 'localStorage' is used
      onRehydrateStorage: (state) => {
        // This function is called when the state is rehydrated from storage
        // We need to manually set the translations based on the rehydrated language
        if (state) {
          state.translations = translations[state.language];
        }
      },
    }
  )
);
