import { API_URL, send, sendAndExpectBody } from "./ApiClient";
import { apiResponse, apiResponseWithBody } from "./dto/ApiResponse";
import { createThoughtDto, fullThoughtDto, thoughtNodeDto, thoughtsTemporalFilterDto } from "./dto/ThoughtDto";

export async function fetchTemporalThoughts(
    filter: thoughtsTemporalFilterDto,
    concept: string | null = null): Promise<apiResponseWithBody<thoughtNodeDto[]>> {

    const temporalQueryParams = new URLSearchParams(
        Object.entries(filter).reduce((acc, [key, value]) => {
            if (value !== undefined && value !== null) {
                acc[key] = String(value);
            }
            return acc;
        }, {} as Record<string, string>)
    ).toString();

    const conceptQueryParams = concept? `&concept=${concept}` : '';

    const response = await sendAndExpectBody<thoughtNodeDto[]>(`${API_URL}/thoughts?${temporalQueryParams}${conceptQueryParams}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        // credentials: 'include'
    });

    return response;
}

export async function fetchThoughtTitles(): Promise<apiResponseWithBody<thoughtNodeDto[]>> {
    const response = await sendAndExpectBody<thoughtNodeDto[]>(`${API_URL}/thoughts/list`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include'
    });

    return response;
}

export async function fetchThought(id: number): Promise<apiResponseWithBody<fullThoughtDto>> {
    const response = await sendAndExpectBody<fullThoughtDto>(`${API_URL}/thoughts/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include'
    });

    return response;
}

export async function fetchReplies(id: number): Promise<apiResponseWithBody<fullThoughtDto[]>> {
    const response = await sendAndExpectBody<fullThoughtDto[]>(`${API_URL}/thoughts/${id}/replies`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });

    return response;
}


export async function postNewThought(thought: createThoughtDto): Promise<apiResponseWithBody<number>> {
    const response = await sendAndExpectBody<number>(`${API_URL}/thoughts`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(thought)
    });

    return response;
}

export async function  fetchTotalThoughtsCount(): Promise<apiResponseWithBody<number>> {
    const response = await sendAndExpectBody<number>(`${API_URL}/thoughts/total-count`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        // credentials: 'include'
    });

    return response;
}

export async function fetchNeighborhoodThoughts(id: number, depth: number, limit: number): Promise<apiResponseWithBody<thoughtNodeDto[][]>> {
    const response = await sendAndExpectBody<thoughtNodeDto[][]>(`${API_URL}/thoughts/${id}/neighborhood?depth=${depth}&limit=${limit}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        // credentials: 'include'
    });

    return response;
}

export async function deleteThought(id: number): Promise<apiResponse> {
    const response = await send(`${API_URL}/thoughts/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include'
    });

    return response;
}