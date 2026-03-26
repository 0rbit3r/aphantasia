import { type ExplorationStateDescriptor} from "../model/explorationMode";
import type { AphantasiaStoreGetAndSet } from "./aphantasiaStore"
import { getCurrentExpState } from "./getCurrentExpState";
import { STATE_CONTRACTS } from "./modes/stateContract";


export const handleStateChange = (store: AphantasiaStoreGetAndSet,
    newState: ExplorationStateDescriptor) => {

    const contract = STATE_CONTRACTS[newState.mode];
    const prevMode = getCurrentExpState(store).mode;

    if (prevMode === newState.mode) {
        contract.hangleFocusChange(store, newState.focus);
    } else {
        STATE_CONTRACTS[prevMode].dispose(store);
        contract.initialize(store);
        contract.hangleFocusChange(store, newState.focus)
    }
}

