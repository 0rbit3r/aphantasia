import type { NodeShape } from "grafika";
import { postBase } from "./apiBase";

export function api_postCreateThought(title: string, content: string, shape: NodeShape, positionX: number, positionY: number): Promise<string> {
    const body = { title, content, shape, positionX, positionY }
    return postBase('/thoughts', body, 'authorize');
}