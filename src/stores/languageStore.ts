import { create } from 'zustand';
import { translations } from '../translations';

type Language = 'en' | 'ar';

interface LanguageState {
  language: Language;
  translations: any;
  setLanguage: (language: Language) => void;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  language: 'en',
  translations: translations.en,
  setLanguage: (language) => set({ language, translations: translations[language] }),
}));
