import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en';
import sv from './locales/sv';

// Get saved language or default to English
const savedLanguage = localStorage.getItem('language') || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      sv: { translation: sv },
    },
    lng: savedLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
