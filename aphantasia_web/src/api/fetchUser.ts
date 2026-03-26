import type { User } from "../model/dto/user";
import { fetchBase } from "./base";

export function api_fetchUser(id: string): Promise<User> {
    return fetchBase<User>('/users/' + id)
}