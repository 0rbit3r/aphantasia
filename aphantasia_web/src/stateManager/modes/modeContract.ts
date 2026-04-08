import type { GrafikaSettings } from "grafika";
import type { AphantasiaStoreGetAndSet } from "../aphantasiaStore";
import type { ExplorationStateDescriptor, ModeType } from "../../model/explorationMode";
import { WelcomeMode } from "./welcome/welcomeMode";
import { WelcomeCreateMode } from "./welcome/welcomeCreateMode";
import { EpochsMode } from "./epochsMode";
import { ExploreMode } from "./exploreMode";
import { CreateMode } from "./createMode";
import { SettingsMode } from "./settingsMode";
import { InboxMode } from "./inboxMode";

export interface ModeContract {
    // settings to initialize grafika with
    grafikaSettings: GrafikaSettings;
    // operations to do on initialized grafika (load data, set focus, handle interaction events...)
    initialize: (store: AphantasiaStoreGetAndSet) => void;
    // handle change of focus
    // this is also called after every initialization
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
};
