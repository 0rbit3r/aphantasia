import { postBase } from "./apiBase";

export function api_postLogin(usernameOrEmail: string, password: string): Promise<string> {
    const body = {
        usernameOrEmail,
        password
    }
    return postBase('/auth/login', body);
}