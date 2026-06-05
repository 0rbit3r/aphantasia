import type { Concept } from "../model/dto/concept";
import { fetchBase } from "./apiBase";

export function api_fetchConcept(tag: string): Promise<Concept> {
    return fetchBase<Concept>('/concept/' + encodeURIComponent(tag));
}
