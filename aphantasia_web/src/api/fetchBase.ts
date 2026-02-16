export function fetchBase<T>(path: string): Promise<T> {
    const token = localStorage.getItem('authToken');
    const headers = new Headers();
    headers.set('Authorization', 'Bearer ' + token);

    return fetch(import.meta.env.VITE_URL + path, {
        headers: headers
    }).then(r => r.json()
        .catch(_ => Promise.reject())
        .then(result => {
            console.log('foo')
            if (result.isSuccess) {
                console.log(result.payload);
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