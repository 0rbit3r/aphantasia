import { API_URL, sendAndExpectBody } from "./ApiClient";
import { apiResponseWithBody } from "./dto/ApiResponse";
import { userProfileDto } from "./dto/userProfileDto";

export async function fetchUserProfile(username: string): Promise<apiResponseWithBody<userProfileDto>> {
    const response = await sendAndExpectBody<userProfileDto>(`${API_URL}/users/${username}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    });

    return response;
}