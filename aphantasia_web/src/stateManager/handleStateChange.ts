import { fetchThought } from "../api/fetchThought_legacy";
import { type ExplorationStateDescriptor } from "../model/explorationMode";
import type { AphantasiaStoreGetAndSet } from "./aphantasiaStore"
import { disposeCurrentState } from "./disposeCurrentState";
import { getCurrentExpState } from "./getCurrentExpState";

export const handleStateChange = (store: AphantasiaStoreGetAndSet,
    newState: ExplorationStateDescriptor) => {

    disposeCurrentState(store);
    const currentState = getCurrentExpState(store);

    if (currentState.mode === 'home' && newState.mode === 'home') {
        if (newState.focus) {
            console.log(newState.focus)
            store.set('contextDataLoading', true);
            fetchThought(newState.focus)
                .then(thought => {
                    store.set('contextDataLoading', false);
                    store.set('contextData', thought);
                }).catch(e => {
                    console.log('failed to fetch thought: ', e );
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
    }
}

