// src/config.ts
import en from './en.json';
import cz from './cz.json';

type Translations = typeof cz; // Define the type of your translations based on one of the JSON files

const getTranslations = (): Translations => {
    // return cz;
    switch (import.meta.env.VITE_LANGUAGE) {
        case 'cz':
            return cz;
        case 'en':
        default:
            return en;
    }
};

export const Localization = getTranslations()