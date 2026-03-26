import { postBase } from "./base";

export function api_postLogin(usernameOrEmail: string, password: string): Promise<string> {
    const body = {
        usernameOrEmail,
        password
    }
    return postBase('/auth/login', body);
}