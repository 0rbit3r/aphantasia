import { type ProxyNode } from "grafika";
import type { StateContract } from "./stateContract";
import { handleForwardExploration } from "../handleForwardExploration";


export const SETTINGS_STATE = {
    grafikaSettings: null!,


    initialize: (store) => {
        store.get.grafika.interactionEvents.on('nodeClicked', (clickedNode: ProxyNode) => {
            handleForwardExploration(store, {
                mode: 'explore',
                focus: clickedNode.id
            });
        });

        store.get.grafika.interactionEvents.on('viewportMoved', () => {
            store.get.grafika.focusOn(null);
        });
        store.set('splitUiLayout', 'content');
    },

    hangleFocusChange: (store, _) => {
        store.get.grafika.focusOn('all');
    },

    dispose: (store) => {
        store.get.grafika.interactionEvents.all.clear();
    }

} satisfies StateContract