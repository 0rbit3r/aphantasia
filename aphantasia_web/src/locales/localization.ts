// src/config.ts
import en from './en.json';
import cz from './cz.json';

type Translations = typeof cz; // Define the type of your translations based on one of the JSON files

const getTranslations = (): Translations => {
    // return cz;
    switch (import.meta.env.VITE_LANGUAGE) {
        case 'en':
        default:
            return en;
        case 'cz':
            return cz;
    }
};

export const Locale = getTranslations()