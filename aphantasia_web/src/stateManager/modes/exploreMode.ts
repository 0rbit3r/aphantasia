import { EdgeType, type ProxyNode } from "grafika";
import type { ModeContract } from "./modeContract";
import { handleForwardExploration } from "../handleForwardExploration";
import { getCurrentExpState } from "../getCurrentExpState";
import { api_fetchThought } from "../../api/fetchThought";

export const ExploreMode = {
    grafikaSettings: {
        graphics: {
            antialiasing: true,
            backgroundColor: '#020202',
            initialZoom: 1 / 100,
            defaultEdgeColor: "source",
            defaultEdgeAlpha: 0.6,
            colorfulText: true,
            defaultEdgeType: EdgeType.Tapered,
            backdrop: {
                startAppearingAt: 0.05,
                fullyVisibleAt: 2,
                parallax: 0.5,
                scale: 15,
                url: "temp.jpg"
            }
        },
        simulation: { pushThreshold: 7000 },
        debug: { showFps: true },
        data: {}
    },


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

        // remove old highlight
        if (getCurrentExpState(store).focus) {
            const highlightedNodeProxy = store.get.grafika.getData().nodes
                .find(n => n.id === getCurrentExpState(store).focus);
            if (highlightedNodeProxy) {
                highlightedNodeProxy.glowEffect = false;
            }
        }

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

        // remove old highlight
        if (getCurrentExpState(store).focus) {
            const highlightedNodeProxy = store.get.grafika.getData().nodes
                .find(n => n.id === getCurrentExpState(store).focus);
            if (highlightedNodeProxy) {
                highlightedNodeProxy.glowEffect = false;
            }
        }
    }

} satisfies ModeContract