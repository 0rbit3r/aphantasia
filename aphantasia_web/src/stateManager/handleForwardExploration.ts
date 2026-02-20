
// This method should take new path as an input

import type { AphantasiaStoreGetAndSet } from "./aphantasiaStore";
import { handleStateChange } from "./stateChangeHandlers/handleStateChange_";
import type { ExplorationStateDescriptor } from "../model/explorationMode";

// It will then append that new path to the end of exploration history and 
export const handleForwardExploration = (store: AphantasiaStoreGetAndSet, newState: ExplorationStateDescriptor) => {
    handleStateChange(store, newState);
    console.log(store.get.explorationHistory);
    store.set('explorationHistory', 
        [...store.get.explorationHistory.slice(0, store.get.explorationIndex + 1), newState]);
    store.set('explorationIndex', prev => prev + 1);
}