export interface Result<T>{
    payload: T;
    isSuccess: boolean;
    error: Error;
}

export interface Error{
    code: number;   
    message: string;
}