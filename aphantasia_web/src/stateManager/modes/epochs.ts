import { EdgeType, type ProxyNode } from "grafika";
import type { StateContract } from "./stateContract";
import { handleForwardExploration } from "../handleForwardExploration";
import { api_fetchEpoch } from "../../api/fetchEpoch";
import { getEdgesFromNodes } from "../../utility/edgesFromThoughts";
import { convertThoughtsToNodes } from "../../utility/thoughtToNodeConvertor";

export const EPOCHS_STATE = {
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
        simulation: { pushThreshold: 3000 },
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

        store.get.grafika.focusOn('all')
        if (store.get.splitUiLayout === 'hidden') store.set('splitUiLayout', 'graph');
    },

    hangleFocusChange: (store, focusId) => {
        store.get.grafika.focusOn('all');

        // todo solve reload on every time?

        store.get.grafika.removeData();
        api_fetchEpoch(focusId)
            .then(epoch => {
                console.log(epoch)
                store.set('contextEpoch', epoch);
                store.get.grafika.addData({
                    nodes: convertThoughtsToNodes(epoch.thoughts),
                    edges: getEdgesFromNodes(epoch.thoughts)
                });
            })
            .catch(e => console.error(e))
    },

    dispose: (store) => {
        store.get.grafika.interactionEvents.all.clear();
    }

} satisfies StateContract