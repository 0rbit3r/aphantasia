import type { ThoughtNode } from "../model/dto/thought";
import type { GraphNode } from "grafika";

export function convertThoughtToNode(thought: ThoughtNode): GraphNode {
    return {
        id: thought.id,
        x: thought.x ? thought.x : 0,
        y: thought.y ? thought.y : 0,
        color: thought.color,
        shape: thought.shape,
        text: thought.title,
        radius: Math.log((thought.size + 100) / 100) * 3000 + 50 // 50 is the base radius here... todo - put this into its own function
    }
}

const INITIAL_POS_RADIUS = 5000;

export function convertThoughtsToNodes(thoughts: ThoughtNode[]): GraphNode[] {
    let angle = 0;
    const step = Math.PI * 2 / thoughts.length
    return thoughts.map(t => {
        const node = convertThoughtToNode(t);
        if (!node.x) node.x = Math.cos(angle) * INITIAL_POS_RADIUS;
        if (!node.y) node.y = Math.sin(angle) * INITIAL_POS_RADIUS;
        angle = angle + step;
        return node;
    });
}