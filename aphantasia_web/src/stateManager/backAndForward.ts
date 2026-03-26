import type { AphantasiaStoreGetAndSet } from "./aphantasiaStore"
import { handleStateChange } from "./handleStateChange";

export const navigateBack = (store: AphantasiaStoreGetAndSet) => {
    if (store.get.explorationIndex < 1) return;
    const newState = store.get.explorationHistory[store.get.explorationIndex - 1];
    handleStateChange(store, newState);

    store.set('explorationIndex', val => val - 1);
}

export const navigateForward = (store: AphantasiaStoreGetAndSet) => {
    if (store.get.explorationIndex === store.get.explorationHistory.length - 1) return;
    const newState = store.get.explorationHistory[store.get.explorationIndex + 1];
    handleStateChange(store, newState);

    store.set('explorationIndex', val => val + 1);
}