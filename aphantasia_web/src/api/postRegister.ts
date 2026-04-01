import { postBase } from "./apiBase";

export function api_postRegister(username: string, email: string | undefined, password: string): Promise<string> {
    const body = {
        username,
        email,
        password
    }
    return postBase('/auth/register', body);
}