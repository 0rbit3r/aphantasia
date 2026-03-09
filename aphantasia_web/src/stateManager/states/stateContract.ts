import type { GrafikaSettings } from "grafika";
import type { AphantasiaStoreGetAndSet } from "../aphantasiaStore";
import type { ExplorationStateDescriptor, ModeType } from "../../model/explorationMode";
import { WELCOME_STATE } from "./welcome";
import { WELCOME_CREATE_STATE } from "./welcomeCreate";

export interface StateContract {
    // settings to initialize grafika with
    grafikaSettings: GrafikaSettings;
    // operations to do on initialized grafika (load data, set focus, handle interaction events...)
    initialize: (store: AphantasiaStoreGetAndSet, focus?: string) => void;
    //handle change of focus
    hangleFocusChange: (store: AphantasiaStoreGetAndSet, focus?: string) => void;
    // get the grafika and state back to state on which a new state can initialize
    dispose: (store: AphantasiaStoreGetAndSet, newState?: ExplorationStateDescriptor) => void;
}


export const STATE_CONTRACTS: Record<ModeType, StateContract> = {
    welcome: WELCOME_STATE,
    welcome_create: WELCOME_CREATE_STATE,
    explore: null!,
    concepts: null!,
    create: null!,
    epochs: null!,
    inbox: null!
};
