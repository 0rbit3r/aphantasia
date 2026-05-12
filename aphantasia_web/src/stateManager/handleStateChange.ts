import { type ExplorationStateDescriptor} from "./explorationMode";
import type { AphantasiaStoreGetAndSet } from "./aphantasiaStore"
import { getCurrentExpState } from "./getCurrentExpState";
import { MODE_CONTRACTS } from "./modes/modeContract";
import { addGrafika } from "grafika";
import { GRAFIKA_INITIALIZERS } from "./modes/grafikaInitializers/grafikaInitTypes";


export const handleStateChange = (store: AphantasiaStoreGetAndSet,
    newState: ExplorationStateDescriptor) => {

        const newModeContract = MODE_CONTRACTS[newState.mode];
        const prevMode = getCurrentExpState(store).mode;

    if (prevMode === newState.mode) {
        newModeContract.hangleFocusChange(store, newState.focus);
    } else {
        handleChangeToDifferentMode(store, getCurrentExpState(store), newState);
    }
}

const handleChangeToDifferentMode = (store: AphantasiaStoreGetAndSet, oldState: ExplorationStateDescriptor, newState: ExplorationStateDescriptor) => {
        const newModeContract = MODE_CONTRACTS[newState.mode];
        const oldModeContract = MODE_CONTRACTS[oldState.mode];

        if (oldModeContract.grafikaInitType !== newModeContract.grafikaInitType){
            store.get.grafika.dispose();
            store.set('grafika', addGrafika(store.get.grafikaElement, GRAFIKA_INITIALIZERS[newModeContract.grafikaInitType]));
            store.get.grafika.simStart();
        }
        oldModeContract.dispose(store);
        newModeContract.initialize(store);
        newModeContract.hangleFocusChange(store, newState.focus)
}