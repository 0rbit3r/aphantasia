import { send, API_URL, sendAndExpectBody } from "./ApiClient";
import { apiResponse, apiResponseWithBody } from "./dto/ApiResponse";
import { LoginRequest } from "./dto/auth/LoginRequest";
import { LoginResponse } from "./dto/auth/LoginResponse";
import { RegisterRequest } from "./dto/auth/RegisterRequest";

async function registerUser(registerRequest: RegisterRequest): Promise<apiResponse> {
    const response = await send(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerRequest),
    });

    return response;
}

async function loginUser(registerRequest: LoginRequest): Promise<apiResponseWithBody<LoginResponse>> {
    const response = await sendAndExpectBody<LoginResponse>(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerRequest),
        credentials: 'include'
    });

    return response;
}

async function testAuth(): Promise<apiResponse> {
    const response = await send( `${API_URL}/auth/test-auth`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include'
    });
    return response;
}

export {testAuth, registerUser, loginUser}