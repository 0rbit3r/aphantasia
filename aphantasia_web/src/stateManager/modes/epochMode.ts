import { type ProxyNode } from "grafika";
import type { ModeContract } from "./modeContract";
import { handleForwardExploration } from "../handleForwardExploration";
import { api_fetchEpoch } from "../../api/fetchEpoch";
import { getEdgesFromNodes } from "../../utility/edgesFromThoughts";
import { convertThoughtsToNodes } from "../../utility/thoughtToNodeConvertor";

export const EpochMode = {
    grafikaInitType: 'main',

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

        store.get.grafika.focusOn('all')
        if (store.get.splitUiLayout === 'hidden' || store.get.splitUiLayout === 'graph')
            store.set('splitUiLayout', 'half');

        store.get.grafika.removeData();
    },

    hangleFocusChange: (store, focusId) => {
        store.get.grafika.focusOn('all');

        store.set('contextDataLoading', true);
        api_fetchEpoch(focusId)
            .then(epoch => {
                epoch.thoughts.sort((a, b) => (a.id < b.id) ? 1 : -1)
                store.set('contextEpoch', epoch);

                const currentIds = new Set(store.get.grafika.getData().nodes.map(n => n.id));
                const newNodes = convertThoughtsToNodes(epoch.thoughts);
                const newIds = new Set(newNodes.map(n => n.id));

                const toAdd = newNodes.filter(n => !currentIds.has(n.id));
                const toRemove = [...currentIds].filter(id => !newIds.has(id)).map(id => ({ id }));

                if (toRemove.length) store.get.grafika.removeData({ nodes: toRemove });
                store.get.grafika.addData({ nodes: toAdd, edges: getEdgesFromNodes(epoch.thoughts) });
            })
            .catch(e => console.error(e))
            .finally(() => store.set('contextDataLoading', false));
    },

    dispose: (store) => {
        store.get.grafika.interactionEvents.all.clear();
        store.set('contextEpoch', undefined);
    }

} satisfies ModeContract