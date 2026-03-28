import { createStore, type SetStoreFunction } from "solid-js/store";
import type { GrafikaInstance } from "grafika";
import type { SplitLayout } from "../components/coreUI/SplitUI";
import type { Thought } from "../model/dto/thought";
import type { Concept } from "../model/dto/concept";
import type { User } from "../model/dto/user";
import type { ExplorationStateDescriptor } from "../model/explorationMode";
import type { ThoughtInMaking } from "../model/ThoughtInMaking";
import type { AuthorizedUser } from "../contexts/authContext";
import type { Epoch } from "../model/dto/epoch";
import type { Notification } from "../components/coreUI/MessageOverlay";

export interface AphantasiaStore {
    grafika: GrafikaInstance;

    // this array holds history of browsing 
    explorationHistory: ExplorationStateDescriptor[];
    // this points to the current exploration state in the array above
    explorationIndex: number;

    contextThought?: Thought;
    contextConcept?: Concept;
    contextUser?: User;
    contextThoughtInMaking?: ThoughtInMaking;
    contextEpoch?: Epoch;

    contextDataLoading: boolean;
    splitUiLayout: SplitLayout;
    modeMenuOpen: boolean;

    notificationMessages: Notification[];

    user?: AuthorizedUser;
}

export interface AphantasiaStoreGetAndSet {
    get: AphantasiaStore,
    set: SetStoreFunction<AphantasiaStore>
}


export function initializeAphantasiaStore(): AphantasiaStoreGetAndSet {
    const [getStore, setStore] = createStore<AphantasiaStore>({
        explorationIndex: 0,
        explorationHistory: [],
        splitUiLayout: 'graph',
        grafika: null!,
        contextDataLoading: false,
        modeMenuOpen: false,
        notificationMessages: []
    });

    return { get: getStore, set: setStore };
};