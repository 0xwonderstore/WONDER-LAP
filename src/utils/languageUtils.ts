// src/utils/languageUtils.ts
import { Locale } from "../types";

export interface Language {
  code: string;
  name: string;
  nativeName: string;
}

// Top 12 most used languages on the internet + specific ones like Arabic
export const topLanguages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
];

/**
 * Gets the display name of a language from its code.
 * Prioritizes the curated list of top languages for accuracy.
 * Falls back to the browser's Intl.DisplayNames for any other language code.
 * @param code - The language code (e.g., 'en', 'ar').
 * @param displayLocale - The locale to display the name in (e.g., 'en' for "Arabic", 'ar' for "العربية").
 * @returns The full language name.
 */
export const getLanguageName = (code: string, displayLocale: Locale = 'en'): string => {
  const matchingLanguage = topLanguages.find(lang => lang.code === code);
  
  if (displayLocale === 'ar' && code === 'ar') {
    return 'العربية';
  }

  if (matchingLanguage) {
    return matchingLanguage.name;
  }

  try {
    const displayName = new Intl.DisplayNames([displayLocale], { type: 'language' });
    return displayName.of(code) || code;
  } catch (error) {
    return code;
  }
};
