import type { ThoughtNode } from "../model/dto/thought";
import type { GraphNode } from "grafika";

export function convertThoughtToNode(thought: ThoughtNode): GraphNode {
    return {
        id: thought.id,
        x: Math.random() * 300 - 150,
        y: Math.random() * 300 - 150,
        color: thought.color,
        shape: thought.shape,
        text: thought.title,
        radius: 50,
    }
} 