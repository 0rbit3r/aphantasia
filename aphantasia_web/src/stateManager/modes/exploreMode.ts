import { type ProxyNode } from "grafika";
import type { ModeContract } from "./modeContract";
import { handleForwardExploration } from "../handleForwardExploration";
import { api_fetchThought } from "../../api/fetchThought";
import { api_fetchNeighborhood } from "../../api/fetchNeighborhood";
import { convertThoughtToNode } from "../../utility/thoughtToNodeConvertor";
import { getEdgesFromNodes } from "../../utility/edgesFromThoughts";
import { removeOldHighlightGlowEffect } from "../../utility/removeOldHighlight";

export const ExploreMode = {
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
    },

    hangleFocusChange: (store, focusId) => {
        if (store.get.splitUiLayout === 'hidden' || store.get.splitUiLayout === 'graph') store.set('splitUiLayout', 'half');

        const grafikaData = store.get.grafika.getData();

        removeOldHighlightGlowEffect(store)

        if (focusId === undefined)
            return; // todo - ???
        store.set('contextDataLoading', true);
        api_fetchThought(focusId).then(thought => {
            store.set('contextThought', thought);
        })
            .catch(e => console.error(e))
            .finally(() => store.set('contextDataLoading', false));


        const focusedNode = grafikaData.nodes.find(n => n.id === focusId);
        // handleHighlightAndContext(store, focusId);
        if (!focusedNode) {
            return;
        }

        store.get.grafika.focusOn(focusedNode);
        focusedNode.glowEffect = true;

        api_fetchNeighborhood(focusId).then(neighbors => {
            const existingIds = new Set(grafikaData.nodes.map(n => n.id));
            const neighborIds = new Set(neighbors.map(n => n.id));
            const allIds = new Set([...existingIds, ...neighborIds]);

            const isHollow = (n: { links: string[], replies: string[] }) =>
                [...n.links, ...n.replies].some(id => !allIds.has(id));

            const existingById = new Map(grafikaData.nodes.map(gn => [gn.id, gn]));
            neighbors.forEach(n => {
                const existing = existingById.get(n.id);
                if (existing) existing.hollowEffect = isHollow(n);
            });

            const nodesToAdd = neighbors
                .filter(n => !existingIds.has(n.id))
                .map(n => ({ ...convertThoughtToNode(n), hollowEffect: isHollow(n) }));

            store.get.grafika.addData({ nodes: nodesToAdd, edges: getEdgesFromNodes(neighbors) });
        }).catch(e => console.error(e));
    },

    dispose: (store) => {
        store.get.grafika.interactionEvents.all.clear();

        removeOldHighlightGlowEffect(store)
    }

} satisfies ModeContract