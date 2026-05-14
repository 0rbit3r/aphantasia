import { type ProxyNode } from "grafika";
import type { ModeContract } from "./modeContract";
import { handleForwardExploration } from "../handleForwardExploration";
import { api_fetchThought } from "../../api/fetchThought";
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

        // // add neighbors
        // let timeToLiveFrom = 0;
        // const nodesToAdd = welcome_data.nodes
        //     .filter(n => welcome_data.edges.some(e =>
        //         (e.sourceId === n.id && e.targetId === focusedNode.id)
        //         || (e.sourceId === focusedNode.id && e.targetId === n.id)))
        //     .filter(nodeToAdd => !grafikaData.nodes.find(existingNode => existingNode.id === nodeToAdd.id))
        //     .map(d => ({
        //         ...d, hollowEffect: true, timeToLiveFrom: -30 * timeToLiveFrom++,
        //         x: focusedNode.x + (Math.random() - 0.5) * 20, y: focusedNode.y + (Math.random() - 0.5) * 20
        //     }));
        // store.get.grafika.addData({ nodes: nodesToAdd });
    },

    dispose: (store) => {
        store.get.grafika.interactionEvents.all.clear();

        removeOldHighlightGlowEffect(store)
    }

} satisfies ModeContract