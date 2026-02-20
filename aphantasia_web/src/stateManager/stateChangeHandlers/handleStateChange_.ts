import { type ExplorationStateDescriptor } from "../../model/explorationMode";
import type { AphantasiaStoreGetAndSet } from "../aphantasiaStore"
import { disposeCurrentState } from "../disposeCurrentState";
import { getCurrentExpState } from "../getCurrentExpState";
import { handleStateChange_Epochs } from "./handleStateChange_Epochs";
import { handleStateChange_Welcome } from "./handleStateChange_Welcome";


// This method should hande the state of the application based on the mode it is set to
// (by exploration index and history in the store)
// It doesn't edit these control values - it only reacts to their vaues by manipulating grafika and other store controls
export const handleStateChange = (store: AphantasiaStoreGetAndSet,
    newState: ExplorationStateDescriptor) => {

    disposeCurrentState(store);
    const currentState = getCurrentExpState(store);

    if (currentState.mode === 'welcome' && newState.mode === 'welcome')
        handleStateChange_Welcome(store, newState);

    if (currentState.mode === 'epochs' && newState.mode === 'epochs') {
        handleStateChange_Epochs(store, newState);
    }
}



