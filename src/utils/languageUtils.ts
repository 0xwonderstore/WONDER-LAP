// src/utils/languageUtils.ts

/**
 * Gets the display name of a language from its code.
 * Uses the browser's built-in Intl.DisplayNames for accurate, dynamic translation.
 * @param code - The language code (e.g., 'en', 'ar').
 * @param displayLocale - The locale to display the name in (e.g., 'en' for "Arabic", 'ar' for "العربية").
 * @returns The full language name.
 */
export const getLanguageName = (code: string, displayLocale: 'en' | 'ar' = 'en'): string => {
  try {
    // Create a new DisplayNames object for the target display locale.
    const displayName = new Intl.DisplayNames([displayLocale], { type: 'language' });
    // Get the name of the language. If the code is invalid, it returns the code itself.
    return displayName.of(code) || code;
  } catch (error) {
    console.error(`Could not get display name for code "${code}" in locale "${displayLocale}":`, error);
    // Fallback to the code if Intl.DisplayNames fails for any reason
    return code;
  }
};
