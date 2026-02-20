import type { ExplorationStateDescriptor } from "../../model/explorationMode";
import type { AphantasiaStoreGetAndSet } from "../aphantasiaStore";

import tutorialJson from '../../assets/tutorial.json';
import { NodeShape, type Data } from "grafika";
const data = tutorialJson satisfies Data;

export const handleStateChange_Welcome = (store: AphantasiaStoreGetAndSet,
    newState: ExplorationStateDescriptor) => {

    const clickedNode = store.get.grafika.getData().nodes.find(n => n.id === newState.focus);
    if (!clickedNode) {
        store.get.grafika.focusOn('all');
        return;
    }

    const nodesToAdd = data.nodes
        .filter(n => data.edges.some(e =>
            (e.sourceId === n.id && e.targetId === clickedNode.id)
            || (e.sourceId === clickedNode.id && e.targetId === n.id)))
        .filter(nodeToAdd => !store.get.grafika.getData().nodes.find(existingNode => existingNode.id === nodeToAdd.id));

    store.get.grafika.addData({
        nodes: nodesToAdd,
        edges: data.edges.filter(e =>
            (nodesToAdd.find(n => n.id === e.targetId) && e.sourceId === clickedNode.id)
            || (nodesToAdd.find(n => n.id === e.sourceId) && e.targetId === clickedNode.id))
    })

    if (clickedNode.id === "hello_explorer") {
        clickedNode.text = "";
        clickedNode.radius = 100;
        clickedNode.blinkEffect = false;
        // clickedNode.shape = NodeShape.DownTriangle;
        clickedNode.hollowEffect = false;
    } else {
        clickedNode.glowEffect = true;
        clickedNode.hollowEffect = false;
        store.set('splitUiLayout', prev => (prev === 'graph' || prev === 'hidden') ? 'half' : prev);
    }
    newState.focus && store.get.grafika.focusOn({ id: newState.focus });
}