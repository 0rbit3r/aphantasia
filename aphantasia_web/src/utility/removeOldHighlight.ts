import type { AphantasiaStoreGetAndSet } from "../stateManager/aphantasiaStore";
import { getCurrentExpState } from "../stateManager/getCurrentExpState";


export const removeOldHighlightGlowEffect = (store: AphantasiaStoreGetAndSet) => {
    if (getCurrentExpState(store).focus) {
        const highlightedNodeProxy = store.get.grafika.getData().nodes
            .find(n => n.id === getCurrentExpState(store).focus);
        if (highlightedNodeProxy) {
            highlightedNodeProxy.glowEffect = false;
        }
    }
}