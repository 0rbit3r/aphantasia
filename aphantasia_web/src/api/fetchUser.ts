import type { User } from "../model/dto/user";
import { fetchBase } from "./apiBase";

export function api_fetchUser(id: string): Promise<User> {
    return fetchBase<User>('/users/' + id)
}