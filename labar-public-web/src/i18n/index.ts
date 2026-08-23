import { en } from './en';
import { my } from './my';

export type Locale = 'en' | 'my';

export const locales: Locale[] = ['en', 'my'];

export const defaultLocale: Locale = 'en';

export function getTranslation(locale: string = 'en') {
  if (locale === 'my') {
    return my;
  }
  return en;
}
