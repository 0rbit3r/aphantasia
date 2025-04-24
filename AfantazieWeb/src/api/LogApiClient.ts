import { sendAndExpectBody, API_URL } from "./ApiClient";
import { apiResponseWithBody } from "./dto/ApiResponse";
import { thoughtNodeDto } from "./dto/ThoughtDto";

export async function fetchLatestLog(amount: number): Promise<apiResponseWithBody<thoughtNodeDto[]>> {
    const response = await sendAndExpectBody<thoughtNodeDto[]>(`${API_URL}/log/latest?amount=${amount}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    });

    return response;
}

export async function fetchHotLog(amount: number): Promise<apiResponseWithBody<thoughtNodeDto[]>> {
    const response = await sendAndExpectBody<thoughtNodeDto[]>(`${API_URL}/log/hot?amount=${amount}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    });

    return response;
}

export async function fetchBiggestLog(amount: number): Promise<apiResponseWithBody<thoughtNodeDto[]>> {
    const response = await sendAndExpectBody<thoughtNodeDto[]>(`${API_URL}/log/big?amount=${amount}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    });

    return response;
}

export const fetchPinnedLog = async (amount: number): Promise<apiResponseWithBody<thoughtNodeDto[]>> => {
    const response = await sendAndExpectBody<thoughtNodeDto[]>(`${API_URL}/log/pinned?amount=${amount}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    });

    return response;
}