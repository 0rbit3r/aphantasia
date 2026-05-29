import type { GrafikaInstance, GraphEdge, GraphNode } from "grafika";

export function updateGrafikaNodes(
    grafika: GrafikaInstance, newNodes: GraphNode[], edges: GraphEdge[], onDone?: () => void) {
    let addDone = false;
    let removeDone = false;
    const currentIds = new Set(grafika.getData().nodes.map(n => n.id));
    const newIds = new Set(newNodes.map(n => n.id));
    const toAdd = newNodes.filter(n => !currentIds.has(n.id));
    const toRemove = [...currentIds].filter(id => !newIds.has(id)).map(id => ({ id }));
    grafika.addData({ nodes: toAdd, edges }, () => {
        addDone = true;
        console.log('adding')
        console.log(addDone, removeDone)
        console.log(toRemove.length)
        if ((removeDone || toRemove.length === 0) && onDone)
            onDone();
    });
    if (toRemove.length) grafika.removeData({ nodes: toRemove, }, () => {
        removeDone = true;
        console.log('removing')
        console.log(addDone, removeDone)
        if ((addDone || toAdd.length === 0) && onDone)
            onDone();
    });
}
