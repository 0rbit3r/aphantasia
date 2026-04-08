import { createContext, createEffect, createSignal, onMount, useContext } from "solid-js";
import { api_authCheck } from "../api/authCheck";
import { api_fetchUser } from "../api/fetchUser";
import { decodeJwt } from 'jose';
import { StoreContext } from "./storeContext";

export interface AuthorizedUser {
    id: string;
    username: string;
    color: string;
}


export const AuthContext = createContext<{
    getAuthorizedUser: () => (AuthorizedUser | null),
    reload: () => void,
    setTokenAndReload: (token: string) => void,
    authStatusLoaded: () => boolean

}>({ getAuthorizedUser: () => null, setTokenAndReload: () => null, reload: () => { }, authStatusLoaded: () => false });


export function AuthContextProvider(props: { children: any }) {
    const store = useContext(StoreContext)!;

    // authorized user that can be accessed throughout the application
    const [getAuthorizedUser, setAuthorizedUser] = createSignal<AuthorizedUser | null>(null);
    const [authStatusLoaded, setAuthStatusLoaded] = createSignal<boolean>(false);
    // Synchronize with store
    createEffect(() => store.set('user', getAuthorizedUser() ?? undefined))


    const loadUser = () => {
        api_authCheck()
            .then(authorized => {
                if (authorized) {
                    const tokenString = localStorage.getItem('authToken')
                    if (tokenString) {
                        const token = decodeJwt(tokenString) as { id: string };
                        api_fetchUser(token.id).then(
                            u => {
                                setAuthorizedUser({ ...u });
                                setAuthStatusLoaded(true)
                            })
                            .catch(errorMsg => {
                                setAuthStatusLoaded(true);
                                return errorMsg;                // Man, this is awful... todo - use await
                            })
                    }
                    else {
                        setAuthStatusLoaded(true)
                    }
                } else setAuthStatusLoaded(true);
            })
            .catch(e => {
                console.error(e);
                store.set('screenMessages', prev => [...prev, { text: e.toString(), color: 'red' }])
                //Note: this is duplicated and explicitely not in finally to ensure that statusLoaded is set LAST
                setAuthStatusLoaded(true);
            })
    }

    onMount(loadUser);


    const setTokenAndReload = (token?: string) => {
        if (token)
            localStorage.setItem('authToken', token);
        else
            localStorage.removeItem('authToken');
        loadUser()
    }


    return (
        <AuthContext.Provider value={{ getAuthorizedUser, setTokenAndReload, authStatusLoaded, reload: loadUser }}>
            {props.children}
        </AuthContext.Provider>
    );
}