
import { SupportedLanguage } from '../types';

export const generateId = () => crypto.randomUUID();

export const getLocalized = (text: any, lang: SupportedLanguage): string => {
  if (!text) return "";
  return text[lang] || text['fr'] || text['en'] || "";
};
