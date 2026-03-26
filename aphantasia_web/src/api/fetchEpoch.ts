import type { Epoch } from "../model/dto/epoch";
import { fetchBase } from "./base";

export function api_fetchEpoch(id?: string): Promise<Epoch> {
    return fetchBase<Epoch>('/epochs/' + (id ?? ""))
}