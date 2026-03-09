export interface User {
    readonly _type: 'User';
    id: string;
    username: string;
    color: string;
    bio: string;
}

export interface UserLight {
    id: string;
    username: string;
    color: string;
}