export const SPECIALIZATIONS = [
  'Frontend Developer',
  'JS Developer',
  'Web Developer',
  'Fullstack Developer',
  'Node.js Developer',
  'Typescript Developer',
  'React Developer',
  'Vue Developer',
] as const;

export type Specialization = typeof SPECIALIZATIONS[number];

export const CATEGORIES = {
  IT: 'it',
  COURIER: 'courier',
} as const;

export type Category = typeof CATEGORIES[keyof typeof CATEGORIES] | string;

export const COUNTRIES = {
  SERBIA: 'serbia',
  ARMENIA: 'armenia',
  GEORGIA: 'georgia',
  UZBEKISTAN: 'uzbekistan',
  USA: 'usa',
  GERMANY: 'germany',
  UK: 'uk',
  NETHERLANDS: 'netherlands',
  POLAND: 'poland',
  FRANCE: 'france',
  SPAIN: 'spain',
  GLOBAL_REMOTE: 'global_remote',
} as const;

export type CountryCode = typeof COUNTRIES[keyof typeof COUNTRIES];

export const COUNTRY_NAMES: Record<string, { en: string; ru: string }> = {
  serbia: { en: 'Serbia', ru: 'Сербия' },
  armenia: { en: 'Armenia', ru: 'Армения' },
  georgia: { en: 'Georgia', ru: 'Грузия' },
  uzbekistan: { en: 'Uzbekistan', ru: 'Узбекистан' },
  usa: { en: 'USA', ru: 'США' },
  germany: { en: 'Germany', ru: 'Германия' },
  uk: { en: 'United Kingdom', ru: 'Великобритания' },
  netherlands: { en: 'Netherlands', ru: 'Нидерланды' },
  poland: { en: 'Poland', ru: 'Польша' },
  france: { en: 'France', ru: 'Франция' },
  spain: { en: 'Spain', ru: 'Испания' },
  global_remote: { en: 'Global Remote', ru: 'Весь мир (Удаленно)' },
};

export const ALLOWED_CIS_COUNTRIES = ['georgia', 'armenia', 'uzbekistan'];
