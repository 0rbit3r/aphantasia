import type { ExplorationStateDescriptor } from "../../model/explorationMode";
import type { AphantasiaStoreGetAndSet } from "../aphantasiaStore";
import tutorialJson from '../../assets/tutorial.json';
import { type Data } from "grafika";
import type { Thought, ThoughtTitle } from "../../model/dto/thought";

const tutorialData = tutorialJson satisfies Data;

export const handleStateChange_Welcome = (store: AphantasiaStoreGetAndSet,
    newState: ExplorationStateDescriptor) => {

    const grafikaData = store.get.grafika.getData();

    const clickedNode = grafikaData.nodes.find(n => n.id === newState.focus);
    if (!clickedNode) {
        store.get.grafika.focusOn('all');
        return;
    }

    let timeToLiveFrom = 0;
    const nodesToAdd = tutorialData.nodes
        .filter(n => tutorialData.edges.some(e =>
            (e.sourceId === n.id && e.targetId === clickedNode.id)
            || (e.sourceId === clickedNode.id && e.targetId === n.id)))
        .filter(nodeToAdd => !grafikaData.nodes.find(existingNode => existingNode.id === nodeToAdd.id))
        .map(d => ({ ...d, hollowEffect: true, timeToLiveFrom: -30 * timeToLiveFrom++ }));

    store.get.grafika.addData({ nodes: nodesToAdd })

    if (clickedNode.id === "hello_explorer") {
        clickedNode.text = "";
        clickedNode.radius = 100;
        clickedNode.blinkEffect = false;
        clickedNode.hollowEffect = false;
        return;
    } else {
        clickedNode.glowEffect = true;
        clickedNode.hollowEffect = false;
        store.set('splitUiLayout', prev => (prev === 'graph' || prev === 'hidden') ? 'half' : prev);
    }
    newState.focus && store.get.grafika.focusOn({ id: newState.focus });


    const focusedThought = tutorialData.nodes.find(n => n.id === newState.focus);
    if (focusedThought) {
        store.set('contextData', {
            ...focusedThought,
            title: focusedThought.text,
            author: { id: "username", username: focusedThought.authorName, color: focusedThought.color },
            concepts: [],
            shape: 0, //focusedNode.shape as NodeShape,
            links: tutorialData.nodes
                .filter(n => tutorialData.edges.find(e => e.sourceId === n.id && e.targetId === focusedThought.id))
                .map<ThoughtTitle>(n => ({ id: n.id, title: n.text, color: n.color, shape: 0 })),
            replies: [],
            size: 0,
        } satisfies Thought)
        const proxyNodeToHighlight = grafikaData.nodes.find(n => n.id === newState.focus)
        if (proxyNodeToHighlight) {
            proxyNodeToHighlight.glowEffect = true;
            store.get.grafika.focusOn(proxyNodeToHighlight);
        }
    }
}

