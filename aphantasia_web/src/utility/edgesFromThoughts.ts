import type { GraphEdge } from "grafika";
import type { ThoughtNode } from "../model/dto/thought";


export function getEdgesFromNodes(thoughts: ThoughtNode[]): GraphEdge[] {

    const edges: GraphEdge[] = [];
    const seen = new Set<string>();

    for (const thought of thoughts) {
        for (const targetId of thought.links) {
            const key = `${thought.id}-${targetId}`;
            if (!seen.has(key)) {
                edges.push({
                    sourceId: thought.id,
                    targetId: targetId
                });
                seen.add(key);
            }
        }
        for (const sourceId of thought.replies) {
            const key = `${sourceId}-${thought.id}`;
            if (!seen.has(key)) {
                edges.push({
                    sourceId: thought.id,
                    targetId: sourceId
                });
                seen.add(key);
            }
        }
    }

    return edges;
}