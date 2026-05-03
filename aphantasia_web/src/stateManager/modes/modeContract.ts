import type { AphantasiaStoreGetAndSet } from "../aphantasiaStore";
import type { ExplorationStateDescriptor, ModeType } from "../explorationMode";
import { WelcomeMode } from "./welcome/welcomeMode";
import { WelcomeCreateMode } from "./welcome/welcomeCreateMode";
import { EpochsMode } from "./epochsMode";
import { ExploreMode } from "./exploreMode";
import { CreateMode } from "./createMode";
import { SettingsMode } from "./settingsMode";
import { InboxMode } from "./inboxMode";
import { ChatMode } from "./chatMode";
import type { GrafikaInitType } from "./grafikaInitializers/grafikaInitTypes";

export interface ModeContract {
    // Grafika settings to initialize the mode with
    // When moving from one mode to another, when this type is different, the grafika instance is disposed and reinitialized
    // This is useful to changing the simulation parameters, backdrop image etc. wthout having to do al of that manually
    // (which is also not yet supported by grafika, so this hack will save some time:-D)
    grafikaInitType: GrafikaInitType;
    // operations to do on initialized grafika (load data, set focus, handle interaction events...)
    initialize: (store: AphantasiaStoreGetAndSet) => void;
    // handle change of focus
    // this is also called after every initialization
    // It is also called before commiting the new state in the history
    //      -> the previous state is accessible throught getCurrentExpState inside this function
    hangleFocusChange: (store: AphantasiaStoreGetAndSet, focus?: string) => void;
    // get the grafika and state back to state on which a new state can initialize
    dispose: (store: AphantasiaStoreGetAndSet, newState?: ExplorationStateDescriptor) => void;
}


export const MODE_CONTRACTS: Record<ModeType, ModeContract> = {
    welcome: WelcomeMode,
    welcome_create: WelcomeCreateMode,
    epochs: EpochsMode,
    explore: ExploreMode,
    create: CreateMode,
    settings: SettingsMode,
    inbox: InboxMode,
    concepts: null!,
    chat: ChatMode,
};
