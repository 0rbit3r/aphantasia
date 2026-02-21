import { EdgeType, type Data, type GrafikaInstance, type ProxyNode } from "grafika";
import type { AphantasiaStoreGetAndSet } from "../aphantasiaStore";
import { handleForwardExploration } from "../handleForwardExploration";
import { getCurrentExpState } from "../getCurrentExpState";

import tutorialJson from '../../assets/tutorial.json';

export const initWelcomeGrafikaSettings = {
    graphics: {
        antialiasing: false,
        backgroundColor: '#000000',
        initialZoom: 1 / 10,
        // floatingNodes: true,
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
        // backdrop: {
        //     startAppearingAt: 0.001,
        //     fullyVisibleAt: 3,
        //     parallax: 0.8,
        //     scale: 8,
        //     url: "generic_space.jpg"
        // },
        // overlay: {
        //     scale: 28,
        //     startDisappearingAt: 1 / 60,
        //     disappearCompletelyAt: 1 / 30,
        //     url: "overlay.png"
        // }
    },
    simulation: { defaultEdgeLength: 300, pushThreshold: 3000 },
    debug: { showFps: true },
    data: {
        nodes: [tutorialJson.nodes.find(n => n.id === "hello_explorer")!],
        edges: tutorialJson.edges
    } satisfies Data,
};


export const initWelcomeState = (grafika: GrafikaInstance, store: AphantasiaStoreGetAndSet) => {
    grafika.focusOn({ id: "hello_explorer" });

    grafika.simStart();

    store.set('splitUiLayout', 'hidden');

    store.get.grafika.interactionEvents.on('nodeClicked', (clickedNode: ProxyNode) => {

        handleForwardExploration({ get: store.get, set: store.set }, {
            mode: getCurrentExpState(store).mode,
            focus: clickedNode.id
        });
    });

    store.get.grafika.interactionEvents.on('viewportMoved', () => {
        store.get.grafika.focusOn(null);
    });
}

