import { EdgeType, type ProxyNode } from "grafika";
import type { ModeContract } from "./modeContract";
import { handleForwardExploration } from "../handleForwardExploration";
import { api_fetchEpoch } from "../../api/fetchEpoch";
import { getEdgesFromNodes } from "../../utility/edgesFromThoughts";
import { convertThoughtsToNodes } from "../../utility/thoughtToNodeConvertor";

export const EpochsMode = {
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
                startAppearingAt: 0.001,
                fullyVisibleAt: 0.1,
                parallax: 0.75,
                scale: 5,
                url: "backdrop.png"
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
        if (store.get.splitUiLayout === 'hidden' || store.get.splitUiLayout === 'graph')
            store.set('splitUiLayout', 'half');
    },

    hangleFocusChange: (store, focusId) => {
        store.get.grafika.focusOn('all');

        // todo solve reload on every time?

        store.get.grafika.removeData();
        store.set('contextDataLoading', true);
        api_fetchEpoch(focusId)
            .then(epoch => {
                epoch.thoughts.sort((a, b)=> (a.id < b.id) ? 1 : -1)
                store.set('contextEpoch', epoch); 
                console.log(getEdgesFromNodes(epoch.thoughts))
                store.get.grafika.addData({
                    nodes: convertThoughtsToNodes(epoch.thoughts),
                    edges: getEdgesFromNodes(epoch.thoughts)
                });
            })
            .catch(e => console.error(e))
            .finally(()=>store.set('contextDataLoading', false));
    },

    dispose: (store) => {
        store.get.grafika.interactionEvents.all.clear();
    }

} satisfies ModeContract