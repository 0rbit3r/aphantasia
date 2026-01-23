
// This method should take new path as an input

import type { AphantasiaStoreGetAndSet } from "./aphantasiaStore";
import { handleStateChange } from "./handleStateChange";
import type { ExplorationStateDescriptor } from "../model/explorationMode";

// It will then append that new path to the end of exploration history and 
export const handleForwardExploration = (store: AphantasiaStoreGetAndSet, newState: ExplorationStateDescriptor) => {
    handleStateChange(store, newState);
    store.set('splitUiLayout', prev => prev === 'graph' ? 'half' : prev);

    store.set('explorationHistory', 
        [...store.get.explorationHistory.slice(0, store.get.explorationIndex + 1), newState]);
    store.set('explorationIndex', prev => prev + 1);
}