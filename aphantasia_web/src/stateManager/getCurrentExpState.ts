import type { AphantasiaStoreGetAndSet } from "./aphantasiaStore"

// returns current exploration state
export const getCurrentExpState = (store: AphantasiaStoreGetAndSet) =>
    store.get.explorationHistory[store.get.explorationIndex];