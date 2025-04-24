import { API_URL, send, sendAndExpectBody } from "./ApiClient";
import { apiResponse, apiResponseWithBody } from "./dto/ApiResponse";
import { notificationDto } from "./dto/NotificationDto";

export async function fetchNotifications(amount: number): Promise<apiResponseWithBody<notificationDto[]>> {
    const response = await sendAndExpectBody<notificationDto[]>(`${API_URL}/notifications?amount=${amount}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include'
    });

    return response;
}

export async function fetchHasUnread(): Promise<apiResponseWithBody<boolean>> {
    const response = await sendAndExpectBody<boolean>(`${API_URL}/notifications/has-unread`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include'
    });

    return response;
}

export async function markAsRead(id: number): Promise<apiResponse> {
    const response = await send(`${API_URL}/notifications/${id}/mark-as-read`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include'
    });

    return response;
}