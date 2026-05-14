
import type { UserProfile } from "../model/dto/userProfile";
import { fetchBase } from "./apiBase";

export function api_fetchUserProfile(id: string): Promise<UserProfile> {
    return fetchBase<UserProfile>('/users/' + id + '/profile')
}