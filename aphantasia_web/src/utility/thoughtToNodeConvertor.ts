import type { ThoughtNode } from "../model/dto/thought";
import type { GraphNode } from "grafika";

export function convertThoughtToNode (thought: ThoughtNode): GraphNode {
    return {
        id: thought.id,
        x: thought.x,
        y: thought.y,
        color: thought.color,
        shape: thought.shape,
        text: thought.title,
        radius: 50,
    }
} 