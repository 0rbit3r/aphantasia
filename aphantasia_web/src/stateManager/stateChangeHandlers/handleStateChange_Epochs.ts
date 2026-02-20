import { fetchThought } from "../../api/fetchThought";
import type { ExplorationStateDescriptor } from "../../model/explorationMode";
import type { AphantasiaStoreGetAndSet } from "../aphantasiaStore";

export const handleStateChange_Epochs = (store: AphantasiaStoreGetAndSet,
    newState: ExplorationStateDescriptor) => {

    if (newState.focus) {
        store.set('contextDataLoading', true);
        fetchThought(newState.focus)
            .then(thought => {
                store.set('contextDataLoading', false);
                store.set('contextData', thought);
            }).catch(e => {
                console.log('failed to fetch thought: ', e);
                store.set('contextData', undefined);
            });
        const proxyNodeToHighlight = store.get.grafika.getData().nodes.find(n => n.id === newState.focus)
        if (proxyNodeToHighlight) {
            proxyNodeToHighlight.glowEffect = true;
            store.get.grafika.focusOn(proxyNodeToHighlight);
        }
    }
    else {
        store.get.grafika.focusOn('all');
        store.set('contextData', undefined);
        store.set('splitUiLayout', 'graph');
    }
    return;
}