import { sendAndExpectBody, API_URL } from "./ApiClient";
import { apiResponseWithBody } from "./dto/ApiResponse";
import { LogDto } from "./dto/LogDto";

export async function getLatestLog(): Promise<apiResponseWithBody<LogDto[]>> {
    const response = await sendAndExpectBody<LogDto[]>(`${API_URL}/log/latest?amount=3`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    });

    return response;
}