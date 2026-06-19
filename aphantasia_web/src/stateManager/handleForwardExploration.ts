
import type { AphantasiaStoreGetAndSet } from "./aphantasiaStore";
import { handleStateChange } from "./handleStateChange";
import type { ExplorationStateDescriptor } from "./explorationMode";
import { MODE_CONTRACTS } from "./modes/modeContract";
import { getCurrentExpState } from "./getCurrentExpState";

// It will then append that new path to the end of exploration history.
// If the target mode declares an entryPoint and the current grafikaInitType differs from the target's,
// the entryPoint state is inserted as a real history step first (e.g. epoch before create when leaving chat).
export const handleForwardExploration = (store: AphantasiaStoreGetAndSet, newState: ExplorationStateDescriptor) => {

    const _finally = () => {
        handleStateChange(store, newState);
        store.set('explorationHistory',
            [...store.get.explorationHistory.slice(0, store.get.explorationIndex + 1), newState]);
        store.set('explorationIndex', prev => prev + 1);
    }

    const targetContract = MODE_CONTRACTS[newState.mode];
    const currentInitType = MODE_CONTRACTS[getCurrentExpState(store).mode].grafikaInitType;
    if (targetContract.entryPoint && currentInitType !== targetContract.grafikaInitType) {
        handleForwardExploration(store, targetContract.entryPoint);
        setTimeout(() =>_finally(), 1500);
        //todo - this is hacky as hell
        // idea - return promise from initialization and use then here and elsewhere?
        return;
    }
    _finally();

}