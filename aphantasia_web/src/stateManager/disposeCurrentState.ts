import { isThought } from "../utility/isTypeOf";
import type { Thought } from "../model/dto/thought";
import type { AphantasiaStoreGetAndSet } from "./aphantasiaStore";
import { getCurrentExpState } from "./getCurrentExpState";

// This will get rid of any part of current state that should not persist to the next one
// such as thought highlights
export const disposeCurrentState = (store: AphantasiaStoreGetAndSet) => {
    // remove old highlight
    
    if (getCurrentExpState(store).focus) {
        const highlightedNodeProxy = store.get.grafika.getData().nodes
            .find(n => n.id === getCurrentExpState(store).focus);
        if (highlightedNodeProxy) {
            highlightedNodeProxy.glowEffect = false;
        }
    }
}