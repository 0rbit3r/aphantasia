export function authCheck(): Promise<boolean> {
    const token = localStorage.getItem('authToken');
    const headers = new Headers();
    headers.set('Authorization', 'Bearer ' + token);
    
    return fetch(import.meta.env.VITE_URL + '/auth/check', { headers })
        .then(r => r.ok)
        .catch(_ => false);
}