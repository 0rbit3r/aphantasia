import type { UserSettings } from "../model/dto/userSettings";
import { fetchBase, postBase } from "./apiBase";

export function api_fetchUserSettings(id: string): Promise<UserSettings> {
    return fetchBase<UserSettings>('/users/' + id + '/settings', 'authorize')
}

export function api_postUserSettings(userSettings: UserSettings): Promise<void> {
    return postBase<void>('/users/' + userSettings.userId + '/settings', userSettings, 'authorize')
}
