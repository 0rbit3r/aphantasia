import type { StateContract } from "./stateContract";
import tutorialJson from '../../assets/tutorial.json';
import { EdgeType, type Data, type ProxyNode } from "grafika";
import { getCurrentExpState } from "../getCurrentExpState";
import { handleForwardExploration } from "../handleForwardExploration";
import type { Thought, ThoughtTitle } from "../../model/dto/thought";
import type { AphantasiaStoreGetAndSet } from "../aphantasiaStore";


const tutorialData = tutorialJson satisfies Data;

export const WELCOME_STATE = {
    grafikaSettings: {
        graphics: {
            antialiasing: true,
            backgroundColor: '#020202',
            initialZoom: 1 / 10,
            floatingNodes: true,
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
        simulation: { defaultEdgeLength: 100, pushThreshold: 1500 },
        debug: { showFps: true },
        data: {
            nodes: [{
                ...tutorialJson.nodes.find(n => n.id === "hello_explorer")!,
                hollowEffect: true, blinkEffect: true, radius: 80
            }],
            edges: tutorialJson.edges
        }
    },


    initialize: (store, focus) => {
        store.get.grafika.interactionEvents.on('nodeClicked', (clickedNode: ProxyNode) => {
            handleForwardExploration(store, {
                mode: getCurrentExpState(store).mode,
                focus: clickedNode.id
            });
        });

        store.get.grafika.interactionEvents.on('viewportMoved', () => {
            store.get.grafika.focusOn(null);
        });

        if (focus === undefined) {
            store.get.grafika.simStart();

            store.get.grafika.focusOn({ id: "hello_explorer" });

            store.set('splitUiLayout', 'hidden');
        }
        else {
            handleHighlightAndData(store, focus);
        }
    },


    hangleFocusChange: (store, focusId) => {

        const grafikaData = store.get.grafika.getData();

        // remove old highlight
        if (getCurrentExpState(store).focus) {
            const highlightedNodeProxy = store.get.grafika.getData().nodes
                .find(n => n.id === getCurrentExpState(store).focus);
            if (highlightedNodeProxy) {
                highlightedNodeProxy.glowEffect = false;
            }
        }

        const focusedNode = grafikaData.nodes.find(n => n.id === focusId);
        handleHighlightAndData(store, focusId);
        if (!focusedNode) {
            return;
        }

        let timeToLiveFrom = 0;
        const nodesToAdd = tutorialData.nodes
            .filter(n => tutorialData.edges.some(e =>
                (e.sourceId === n.id && e.targetId === focusedNode.id)
                || (e.sourceId === focusedNode.id && e.targetId === n.id)))
            .filter(nodeToAdd => !grafikaData.nodes.find(existingNode => existingNode.id === nodeToAdd.id))
            .map(d => ({
                ...d, hollowEffect: true, timeToLiveFrom: -30 * timeToLiveFrom++,
                x: focusedNode.x + (Math.random() - 0.5) * 20, y: focusedNode.y + (Math.random() - 0.5) * 20
            }));

        store.get.grafika.addData({ nodes: nodesToAdd })

        if (focusedNode.id === "hello_explorer") {
            focusedNode.text = "";
            focusedNode.blinkEffect = false;
            focusedNode.hollowEffect = false;
            return;
        } else {
            focusedNode.glowEffect = true;
            focusedNode.hollowEffect = false;
            store.set('splitUiLayout', prev => (prev === 'graph' || prev === 'hidden') ? 'half' : prev);
        }
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

} satisfies StateContract




const handleHighlightAndData = (store: AphantasiaStoreGetAndSet, focusId?: string) => {
    const focusedThought = tutorialData.nodes.find(n => n.id === focusId);
    if (focusedThought) {
        store.set('contextData', {
            ...focusedThought,
            _type: "Thought",
            title: focusedThought.text,
            author: { id: "username", username: focusedThought.authorName, color: focusedThought.color },
            concepts: [],
            shape: 0,
            links: tutorialData.nodes
                .filter(n => tutorialData.edges.find(e => e.sourceId === n.id && e.targetId === focusedThought.id))
                .map<ThoughtTitle>(n => ({ id: n.id, title: n.text, color: n.color, shape: 0 })),
            replies: tutorialData.nodes
                .filter(n => tutorialData.edges.find(e => e.targetId === n.id && e.sourceId === focusedThought.id))
                .map<ThoughtTitle>(n => ({ id: n.id, title: n.text, color: n.color, shape: 0 })),
            size: 0,
        } satisfies Thought)
        const proxyNodeToHighlight = store.get.grafika.getData().nodes?.find(n => n.id === focusId)
        if (proxyNodeToHighlight) {
            proxyNodeToHighlight.glowEffect = true;
            store.get.grafika.focusOn(proxyNodeToHighlight);
        }
        else
            store.get.grafika.focusOn('all');
    }
}