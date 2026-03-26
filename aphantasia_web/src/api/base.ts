export function fetchBase<T>(path: string, authorize?: 'authorize'): Promise<T> {
    const token = localStorage.getItem('authToken');
    const headers = new Headers();
    if (authorize)
        headers.set('Authorization', 'Bearer ' + token);

    return fetch(import.meta.env.VITE_URL + path, {
        headers: headers
    }).then(r => r.json()
        // parse result object
        .catch(_ => Promise.reject())
        .then(result => {
            if (result.isSuccess) {
                return result.payload;
            }
            else {
                console.log(result.error.statue + ': ' + result.error.message)
                return Promise.reject(result.error.message);
            }
        }
        )).catch(
            e => Promise.reject(e)
        );
}

export function postBase<T>(path: string, body: object, authorize?: 'authorize'): Promise<T> {
    const token = localStorage.getItem('authToken');
    const headers = new Headers();
    if (authorize)
        headers.set('Authorization', 'Bearer ' + token);
    headers.set('Content-type', 'application/json')

    console.log(JSON.stringify(body))

    return fetch(import.meta.env.VITE_URL + path, {
        headers: headers, method: 'POST', body: JSON.stringify(body)
    }).then(r => r.json()
        // parse result object
        .catch(_ => Promise.reject())
        .then(result => {
            if (result.isSuccess) {
                return result.payload;
            }
            else {
                console.log(result.error.statue + ': ' + result.error.message)
                return Promise.reject(result.error.message);
            }
        }
        )).catch(
            _ => Promise.reject()
        );
}