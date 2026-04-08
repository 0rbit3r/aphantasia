import { type ProxyNode } from "grafika";
import type { ModeContract } from "./modeContract";
import { handleForwardExploration } from "../handleForwardExploration";


export const SettingsMode = {
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
        if( store.get.splitUiLayout !== 'content') store.set('splitUiLayout', 'half');
    },

    hangleFocusChange: (store, _) => {
        store.get.grafika.focusOn('all');
    },

    dispose: (store) => {
        store.get.grafika.interactionEvents.all.clear();
    }

} satisfies ModeContract