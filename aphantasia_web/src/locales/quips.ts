// src/config.ts
import en from './en_quips.json';
import cz from './cz_quips.json';

type Translations = typeof en; // Define the type of your translations based on one of the JSON files

const getQuips = (): Translations => {
    // return cz;
    switch (import.meta.env.VITE_LANGUAGE) {
        case 'cz':
            return cz;
        case 'en':
        default:
            return en;
    }
};

export const Quips = getQuips()