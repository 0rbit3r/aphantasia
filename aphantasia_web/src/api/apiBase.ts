// Base GETters, POSTers etc.ers...
// These methods expect the endpoints to return Result objects and throw
// 'bad json' rejection otherwise


export function fetchBase<T>(path: string, authorize?: 'authorize'): Promise<T> {
    const token = localStorage.getItem('authToken');
    const headers = new Headers();
    if (authorize)
        headers.set('Authorization', 'Bearer ' + token);

    return fetch(import.meta.env.VITE_URL + import.meta.env.VITE_API_PATH + path, {
        headers: headers
    }).then(r => r.json()
        // parse result object
        .catch(_ => Promise.reject('bad json'))
        .then(result => {
            if (result.isSuccess) {
                return result.payload;
            }
            else {
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

    return fetch(import.meta.env.VITE_URL + import.meta.env.VITE_API_PATH + path, {
        headers: headers, method: 'POST', body: JSON.stringify(body)
    }).then(r => r.json()
        // parse result object
        .catch(_ => Promise.reject('bad json'))
        .then(result => {
            if (result.isSuccess) {
                return result.payload;
            }
            else {
                return Promise.reject(result.error.message);
            }
        }
        )).catch(

            e => Promise.reject(e)
        );
}

export function deleteBase<T>(path: string): Promise<T> {
    const token = localStorage.getItem('authToken');
    const headers = new Headers();
    headers.set('Authorization', 'Bearer ' + token);

    return fetch(import.meta.env.VITE_URL + import.meta.env.VITE_API_PATH + path, {
        headers: headers, method: 'DELETE'
    }).then(r => r.json()
        // parse result object
        .catch(r => r)
        .then(result => {
            if (result.isSuccess) {
                return result.payload;
            }
            else {
                return Promise.reject(result.error.message);
            }
        }
        )).catch(
            e => Promise.reject(e)
        );
}