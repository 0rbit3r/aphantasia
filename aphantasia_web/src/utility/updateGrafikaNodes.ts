import type { GrafikaInstance, GraphEdge, GraphNode } from "grafika";

export function updateGrafikaNodes(grafika: GrafikaInstance, newNodes: GraphNode[], edges: GraphEdge[]) {
    const currentIds = new Set(grafika.getData().nodes.map(n => n.id));
    const newIds = new Set(newNodes.map(n => n.id));
    const toAdd = newNodes.filter(n => !currentIds.has(n.id));
    const toRemove = [...currentIds].filter(id => !newIds.has(id)).map(id => ({ id }));
    grafika.addData({ nodes: toAdd, edges });
    if (toRemove.length) grafika.removeData({ nodes: toRemove });
}
