
import type { AphantasiaStoreGetAndSet } from "./aphantasiaStore";
import { handleStateChange } from "./handleStateChange";
import type { ExplorationStateDescriptor } from "./explorationMode";

// It will then append that new path to the end of exploration history
export const handleForwardExploration = (store: AphantasiaStoreGetAndSet, newState: ExplorationStateDescriptor) => {
    handleStateChange(store, newState);
    store.set('explorationHistory', 
        [...store.get.explorationHistory.slice(0, store.get.explorationIndex + 1), newState]);
    store.set('explorationIndex', prev => prev + 1);
}