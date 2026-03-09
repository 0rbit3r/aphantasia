import { type ExplorationStateDescriptor} from "../../model/explorationMode";
import type { AphantasiaStoreGetAndSet } from "../aphantasiaStore"
// import { disposeCurrentState } from "../stateDisposers/disposeCurrentState";
import { getCurrentExpState } from "../getCurrentExpState";
import { STATE_CONTRACTS } from "../states/stateContract";
// import { handleStateChange_Epochs } from "./handleStateChange_Epochs";
// import { handleStateChange_Welcome } from "./handleStateChange_Welcome";
// import { handleStateChange_WelcomeCreate } from "./handleStateChange_WelcomeCreate";


// This method should hande the state of the application based on the mode it is set to
// (by exploration index and history in the store)
// It doesn't edit these control values - it only reacts to their vaues by manipulating grafika and other store controls
export const handleStateChange = (store: AphantasiaStoreGetAndSet,
    newState: ExplorationStateDescriptor) => {

    const contract = STATE_CONTRACTS[newState.mode];
    const prevMode = getCurrentExpState(store).mode;

    if (prevMode === newState.mode) {
        contract.hangleFocusChange(store, newState.focus);
    } else {
        STATE_CONTRACTS[prevMode].dispose(store);
        contract.initialize(store, newState.focus);
    }
}

