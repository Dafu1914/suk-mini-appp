import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import am from './am.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      am: { translation: am },
    },
    lng: 'am',          // Default language: Amharic
    fallbackLng: 'am',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;