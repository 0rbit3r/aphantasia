export interface apiResponse{
    status: number;
    error?: string;
    ok: boolean;
}

export interface apiResponseWithBody<T> extends apiResponse {
    data?: T;
}