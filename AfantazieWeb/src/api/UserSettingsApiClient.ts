import { API_URL, send, sendAndExpectBody } from "./ApiClient";
import { apiResponse as ApiResponse, apiResponseWithBody as ApiResponseWithBody } from "./dto/ApiResponse";
import { userSettingsDto as UserSettings } from "./dto/UserSettingsDto";

export async function fetchUserSettings(): Promise<ApiResponseWithBody<UserSettings>> {
    const response = await sendAndExpectBody<UserSettings>(`${API_URL}/user-settings`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include'
    });

    return response;
}

export async function postUserSettings(settings: UserSettings): Promise<ApiResponse> {
    const response = await send(`${API_URL}/user-settings`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify(settings)
        }
    )
    return response;
}