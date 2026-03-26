import type { Data } from 'grafika';
import tutorialJson from '../../../assets/tutorial.json';

const tutorialData = tutorialJson satisfies Data;

export const welcome_data = tutorialData;