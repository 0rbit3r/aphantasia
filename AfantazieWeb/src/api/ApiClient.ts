import { apiResponse, apiResponseWithBody } from './dto/ApiResponse';

const API_URL = import.meta.env.VITE_URL + import.meta.env.VITE_API_PATH;

async function sendAndExpectBody<T_Body>(url: string, options: RequestInit): Promise<apiResponseWithBody<T_Body>> {

    const token = localStorage.getItem('token');
    options.headers = {
        ...options.headers,
        'Authorization': token ? `Bearer ${token}` : '',
    };

    try {
        const response = await fetch(url, options);
        const data = await response.json();

        if (!response.ok) {
            return {
                status: response.status,
                error: data.error,
                ok: false
            };
        }

        return {
            data: data as T_Body,
            status: response.status,
            ok: true
        };

    } catch (error: any) {
        console.log(error.toString());
        return {
            status: 500,
            error: "Něco se pokazilo. Běžně by se tu mělo psát něco jako 'Zkuste to prosím znovu', ale co si budem... asi se mi to rozbilo.",
            ok: false
        };
    }
}

async function send(url: string, options: RequestInit): Promise<apiResponse> {

    const token = localStorage.getItem('token');
    options.headers = {
        ...options.headers,
        'Authorization': token ? `Bearer ${token}` : '',
    };

    try {
        const response = await fetch(url, options);

        var error = "";
        try {
            const data = await response.json();
            error = data.error;
        }
        catch {
            error = "Chybka vedla k chybce a proměnná 'data' neměla proprťku 'error'. To by teoreticky nemělo nikdy nastat...";
        }

        if (!response.ok) {
            return {
                status: response.status,
                error: error,
                ok: false
            };
        }

        return {
            status: response.status,
            ok: true
        };

    } catch (error: any) {
        console.log(error.toString());
        return {
            status: 500,
            error: "Něco se pokazilo. Běžně by se tu mělo psát něco jako 'Zkuste to prosím znovu', ale co si budem... asi se mi to rozbilo.",
            ok: false
        };
    }
}

export { API_URL, send, sendAndExpectBody }