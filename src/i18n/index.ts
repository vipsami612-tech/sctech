import { en } from './en';
import { am } from './am';
import { Language } from '../types';

export const translations = {
  en,
  am
};

export function getTranslations(lang: Language = 'en') {
  return translations[lang] || translations.en;
}

export { en, am };
