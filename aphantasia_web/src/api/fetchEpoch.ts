import type { Epoch } from "../model/dto/epoch";
import { fetchBase } from "./fetchBase";

export function fetchEpoch(id?: string): Promise<Epoch> {
    return fetchBase<Epoch>('/epochs/' + (id ?? ""))
}