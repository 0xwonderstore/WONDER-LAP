import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { translations } from './translations';
import { useLanguageStore } from './stores/languageStore';

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources: {
      en: { translation: translations.en },
      ar: { translation: translations.ar },
    },
    lng: useLanguageStore.getState().language, // initial language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

// Update i18n language when the store's language changes
useLanguageStore.subscribe((state) => {
  if (i18n.language !== state.language) {
    i18n.changeLanguage(state.language);
  }
});

export default i18n;
