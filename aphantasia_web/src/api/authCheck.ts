export function api_authCheck(): Promise<boolean> {
    const token = localStorage.getItem('authToken');
    const headers = new Headers();
    headers.set('Authorization', 'Bearer ' + token);

    return fetch(import.meta.env.VITE_URL + import.meta.env.VITE_API_PATH + '/auth/check', { headers })
        .then(r => {console.log(r.status); return r.status === 200})
        .catch(e => { console.log(e); return Promise.reject('Connection error - Site may be unavailable') });
}