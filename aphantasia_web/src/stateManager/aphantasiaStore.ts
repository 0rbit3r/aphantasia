import { createStore, type SetStoreFunction } from "solid-js/store";
import type { GrafikaInstance } from "grafika";
import type { SplitLayout } from "../components/SplitUI";
import type { Thought } from "../model/dto/thought";
import type { Concept } from "../model/dto/concept";
import type { User } from "../model/dto/user";
import type { ExplorationStateDescriptor } from "../model/explorationMode";

export interface AphantasiaStore {
    grafika: GrafikaInstance;

    // this array holds history of browsing 
    explorationHistory: ExplorationStateDescriptor[];
    // this points to the current exploration state in the array above
    explorationIndex: number;
    

    contextData?: Thought | Concept | User;

    contextDataLoading: boolean;

    splitUiLayout: SplitLayout;
}

export interface AphantasiaStoreGetAndSet {
    get: AphantasiaStore,
    set: SetStoreFunction<AphantasiaStore>
}

export function initializeAphantasiaStore(): AphantasiaStoreGetAndSet {
    const [getStore, setStore] = createStore<AphantasiaStore>({
        explorationIndex: 0,
        explorationHistory: [{mode: 'home'}],
        splitUiLayout: 'graph',
        grafika: null!, //todo - this smells,
        contextDataLoading: false
    });

    return { get: getStore, set: setStore};
};