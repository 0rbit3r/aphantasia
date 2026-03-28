import type { Epoch } from "../model/dto/epoch";
import { fetchBase } from "./apiBase";

export function api_fetchEpoch(id?: string): Promise<Epoch> {
    return fetchBase<Epoch>('/epochs/' + (id ?? ""))
}