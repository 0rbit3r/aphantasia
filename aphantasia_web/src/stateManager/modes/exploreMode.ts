import { type ProxyNode } from "grafika";
import type { ModeContract } from "./modeContract";
import type { ThoughtNode } from "../../model/dto/thought";
import { handleForwardExploration } from "../handleForwardExploration";
import { api_fetchThought } from "../../api/fetchThought";
import { api_fetchNeighborhood } from "../../api/fetchNeighborhood";
import { convertThoughtToNode } from "../../utility/thoughtToNodeConvertor";
import { getEdgesFromNodes } from "../../utility/edgesFromThoughts";
import { removeOldHighlightGlowEffect } from "../../utility/removeOldHighlight";

const nodeThoughtData = new WeakMap<ProxyNode, ThoughtNode>();

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

        if (focusedNode) {
            store.get.grafika.focusOn(focusedNode);
            focusedNode.glowEffect = true;
        }

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
                console.log('existing ' + existing?.text + ' ' + isHollow(n))
            });

            let gradualAddIndex = 0;
            const nodesToAdd = neighbors
                .filter(n => !existingIds.has(n.id))
                .map(n => ({ ...convertThoughtToNode(n), hollowEffect: isHollow(n), timeToLiveFrom: 20 * gradualAddIndex++ }));

            store.get.grafika.addData({ nodes: nodesToAdd, edges: getEdgesFromNodes(neighbors) }, () => {
                const allCurrentById = new Map(store.get.grafika.getData().nodes.map(n => [n.id, n]));

                neighbors.forEach(n => {
                    const proxy = allCurrentById.get(n.id);
                    if (proxy) nodeThoughtData.set(proxy, n);
                });

                neighbors.forEach(n => {
                    [...n.links, ...n.replies].forEach(nnId => {
                        const nn = allCurrentById.get(nnId);
                        if (nn?.hollowEffect) {
                            const nnData = nodeThoughtData.get(nn);
                            if (nnData && ![...nnData.links, ...nnData.replies].some(id => !allIds.has(id)))
                                nn.hollowEffect = false;
                        }
                    });
                });

                if (!focusedNode) {
                    const addedNode = allCurrentById.get(focusId);
                    if (addedNode) {
                        store.get.grafika.focusOn(addedNode);
                        addedNode.glowEffect = true;
                    }
                }
            });
        }).catch(e => console.error(e));
    },

    dispose: (store) => {
        store.get.grafika.interactionEvents.all.clear();
        store.get.grafika.getData().nodes.forEach(n => {
            if (n.hollowEffect)
                n.hollowEffect = false;
        })

        removeOldHighlightGlowEffect(store)
    }

} satisfies ModeContract