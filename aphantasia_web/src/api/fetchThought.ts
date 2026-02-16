import type { Thought} from "../model/dto/thought";
import { fetchBase } from "./fetchBase";

export function fetchThought(id: string): Promise<Thought> {
    return fetchBase<Thought>('/thoughts/' + id)
}