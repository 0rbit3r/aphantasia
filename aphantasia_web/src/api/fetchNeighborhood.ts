import type { ThoughtNode } from "../model/dto/thought";
import { fetchBase } from "./apiBase";

export function api_fetchNeighborhood(id: string, depth = 1, limit = 100): Promise<ThoughtNode[]> {
    return fetchBase<ThoughtNode[]>(`/thoughts/${id}/neighborhood?depth=${depth}&limit=${limit}`)
}
