import { type ExplorationStateDescriptor } from "./explorationMode";
import type { AphantasiaStoreGetAndSet } from "./aphantasiaStore"
import { getCurrentExpState } from "./getCurrentExpState";
import { MODE_CONTRACTS, type ModeContract } from "./modes/modeContract";
import { GRAFIKA_INITIALIZERS } from "./modes/grafikaInitializers/grafikaInitTypes";
import { handleGrafikaReinitialization } from "../utility/ handleAddGrafika";


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

    if (oldModeContract.grafikaInitType !== newModeContract.grafikaInitType) {
        handleGrafikaReinitialization(store, GRAFIKA_INITIALIZERS[newModeContract.grafikaInitType], grafika => {
            grafika.simStart();
            switchMode(store, oldModeContract, newModeContract, newState);
        });
    } else {
        switchMode(store, oldModeContract, newModeContract, newState);
    }
}

const switchMode = (store: AphantasiaStoreGetAndSet, oldModeContract: ModeContract, newModeContract: ModeContract, newState: ExplorationStateDescriptor) => {
    oldModeContract.dispose(store);
    newModeContract.initialize(store);
    newModeContract.hangleFocusChange(store, newState.focus);
}