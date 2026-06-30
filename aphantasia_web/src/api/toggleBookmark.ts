import { postBase } from "./apiBase";

export const api_toggleBookmark = (thoughtId: string): Promise<boolean> =>
    postBase<boolean>(`/thoughts/${thoughtId}/bookmark`, {}, 'authorize');
