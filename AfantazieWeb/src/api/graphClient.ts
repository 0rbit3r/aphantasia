import { API_URL, sendAndExpectBody } from "./ApiClient";
import { apiResponseWithBody as ApiResponseWithBody } from "./dto/ApiResponse";
import { NotificationDto } from "./dto/NotificationDto";
import { createThoughtDto, fullThoughtDto, thoughtColoredTitleDto, thoughtNodeDto, thoughtsTemporalFilterDto } from "./dto/ThoughtDto";

export async function fetchTemporalThoughts(filter: thoughtsTemporalFilterDto): Promise<ApiResponseWithBody<thoughtNodeDto[]>> {

    const queryParams = new URLSearchParams(
        Object.entries(filter).reduce((acc, [key, value]) => {
            if (value !== undefined && value !== null) {
                acc[key] = String(value);
            }
            return acc;
        }, {} as Record<string, string>)
    ).toString();

    const response = await sendAndExpectBody<fullThoughtDto[]>(`${API_URL}/thoughts?${queryParams}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        // credentials: 'include'
    });

    return response;
}

export async function fetchThoughtTitles(): Promise<ApiResponseWithBody<thoughtColoredTitleDto[]>> {
    const response = await sendAndExpectBody<fullThoughtDto[]>(`${API_URL}/thoughts/titles`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include'
    });

    return response;
}

export async function fetchThought(id: number): Promise<ApiResponseWithBody<fullThoughtDto>> {
    const response = await sendAndExpectBody<fullThoughtDto>(`${API_URL}/thoughts/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include'
    });

    return response;
}

export async function fetchReplies(id: number): Promise<ApiResponseWithBody<fullThoughtDto[]>> {
    const response = await sendAndExpectBody<fullThoughtDto[]>(`${API_URL}/thoughts/${id}/replies`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });

    return response;
}


export async function postNewThought(thought: createThoughtDto): Promise<ApiResponseWithBody<number>> {
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

export async function  getTotalThoughtsCount(): Promise<ApiResponseWithBody<number>> {
    const response = await sendAndExpectBody<number>(`${API_URL}/thoughts/total-count`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        // credentials: 'include'
    });

    return response;
}

export async function getNotifications(): Promise<ApiResponseWithBody<NotificationDto[]>> {
    const response = await sendAndExpectBody<NotificationDto[]>(`${API_URL}/notifications`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include'
    });

    return response;
}

export async function fetchNeighborhoodThoughts(id: number, depth: number): Promise<ApiResponseWithBody<thoughtNodeDto[]>> {
    const response = await sendAndExpectBody<thoughtNodeDto[]>(`${API_URL}/thoughts/${id}/neighborhood?depth=${depth}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        // credentials: 'include'
    });

    return response;
}