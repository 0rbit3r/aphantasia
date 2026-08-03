import type { ConceptGraph } from "../model/dto/concept";
import { fetchBase } from "./apiBase";

export function api_fetchConcepts(): Promise<ConceptGraph> {
    return fetchBase<ConceptGraph>('/concepts');
}
