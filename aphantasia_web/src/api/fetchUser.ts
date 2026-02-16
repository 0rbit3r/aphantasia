import type { User } from "../model/dto/user";
import { fetchBase } from "./fetchBase";

export function fetchUser(id: string): Promise<User> {
    return fetchBase<User>('/users/' + id)
}