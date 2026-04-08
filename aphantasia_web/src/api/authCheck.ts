export function api_authCheck(): Promise<boolean> {
    const token = localStorage.getItem('authToken');
    const headers = new Headers();
    headers.set('Authorization', 'Bearer ' + token);

    return fetch(import.meta.env.VITE_URL + import.meta.env.VITE_API_PATH + '/auth/check', { headers })
        .then(r => r.status === 200)
        .catch(_ => Promise.reject('Connection error - Site may be unavailable'));
}