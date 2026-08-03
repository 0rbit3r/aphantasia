
import type { AphantasiaStoreGetAndSet } from "./aphantasiaStore";
import { handleStateChange } from "./handleStateChange";
import type { ExplorationStateDescriptor } from "./explorationMode";
import { MODE_CONTRACTS } from "./modes/modeContract";
import { getCurrentExpState } from "./getCurrentExpState";

// It will then append that new path to the end of exploration history.
// If the target mode declares an entryPoint and the current grafikaInitType differs from the target's,
// the entryPoint state is inserted as a real history step first (e.g. epoch before create when leaving chat).
export const handleForwardExploration = (store: AphantasiaStoreGetAndSet, newState: ExplorationStateDescriptor) => {
    const targetContract = MODE_CONTRACTS[newState.mode];
    const currentInitType = MODE_CONTRACTS[getCurrentExpState(store).mode].grafikaInitType;

    if (targetContract.entryPoint && currentInitType !== targetContract.grafikaInitType) {
        console.log(targetContract.entryPoint )
        handleForwardExploration(store, targetContract.entryPoint);
        setTimeout(() => {
            handleStateChange(store, newState);
            store.set('explorationHistory',
                [...store.get.explorationHistory.slice(0, store.get.explorationIndex + 1), newState]);
            store.set('explorationIndex', prev => prev + 1);
        },
            1000);
            // uglyass hack, still... todo Gotta make grafika and a whole bunch of code asynchronous...

    }
    else {
        handleStateChange(store, newState);
        store.set('explorationHistory',
            [...store.get.explorationHistory.slice(0, store.get.explorationIndex + 1), newState]);
        store.set('explorationIndex', prev => prev + 1);
    }
}