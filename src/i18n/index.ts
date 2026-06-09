import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en';
import sv from './locales/sv';

// Detect best initial language:
// 1. Use saved preference if set.
// 2. Otherwise auto-detect from device language (Swedish device → 'sv').
// 3. Fallback to English.
const detectInitialLanguage = (): string => {
  const saved = localStorage.getItem('language');
  if (saved === 'en' || saved === 'sv') return saved;

  const candidates: string[] = [];
  if (typeof navigator !== 'undefined') {
    if (navigator.languages?.length) candidates.push(...navigator.languages);
    if (navigator.language) candidates.push(navigator.language);
  }
  for (const c of candidates) {
    const lower = c.toLowerCase();
    if (lower.startsWith('sv')) return 'sv';
    if (lower.startsWith('en')) return 'en';
  }
  return 'en';
};

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    sv: { translation: sv },
  },
  lng: detectInitialLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
