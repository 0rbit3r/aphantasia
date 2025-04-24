import { API_URL, sendAndExpectBody } from "./ApiClient";
import { apiResponseWithBody } from "./dto/ApiResponse";
import { conceptDto } from "./dto/ConceptDto";

export async function fetchConcept(tag: string): Promise<apiResponseWithBody<conceptDto>> {
    const response = await sendAndExpectBody<conceptDto>(`${API_URL}/concepts/${tag}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    });

    return response;
}