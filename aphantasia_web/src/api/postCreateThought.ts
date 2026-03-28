import type { NodeShape } from "grafika";
import { postBase } from "./apiBase";

export function api_postCreateThought(title: string, content: string, shape: NodeShape): Promise<string> {
    const body = { title, content, shape }
    return postBase('/thoughts', body, 'authorize');
}