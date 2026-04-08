import { type ExplorationStateDescriptor} from "../model/explorationMode";
import type { AphantasiaStoreGetAndSet } from "./aphantasiaStore"
import { getCurrentExpState } from "./getCurrentExpState";
import { MODE_CONTRACTS } from "./modes/modeContract";


export const handleStateChange = (store: AphantasiaStoreGetAndSet,
    newState: ExplorationStateDescriptor) => {

    const contract = MODE_CONTRACTS[newState.mode];
    const prevMode = getCurrentExpState(store).mode;

    if (prevMode === newState.mode) {
        contract.hangleFocusChange(store, newState.focus);
    } else {
        MODE_CONTRACTS[prevMode].dispose(store);
        contract.initialize(store);
        contract.hangleFocusChange(store, newState.focus)
    }
}

