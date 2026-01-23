// src/config.ts
import en from './en_tutorial.json';

type Translations = typeof en; // Define the type of your translations based on one of the JSON files

const getTutorial = (): Translations => {
    // return cz;
    switch (import.meta.env.VITE_LANGUAGE) {
    //     case 'cz':
    //         return cz;
        case 'en':
        default:
            return en;
    }
};

export const TutorialText = getTutorial()