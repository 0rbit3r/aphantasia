import type { Thought} from "../model/dto/thought";
import { fetchBase } from "./apiBase";

export function api_fetchThought(id: string): Promise<Thought> {
    return fetchBase<Thought>('/thoughts/' + id)
}