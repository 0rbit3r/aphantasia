import { createContext, createSignal, onMount, type JSX } from "solid-js";
import { authCheck } from "../api/authCheck";
import { fetchUser } from "../api/fetchUser";
import { decodeJwt } from 'jose';

export interface AuthorizedUser {
    id: string;
    username: string;
    color: string;
}

export const AuthContext = createContext<{getAuthorizedUser:() => (AuthorizedUser | null)}>({getAuthorizedUser: () => null});

interface AuthContextProviderProps { children: JSX.Element; }

export function AuthContextProvider(props: AuthContextProviderProps) {
    const [getAuthorizedUser, setAuthorizedUser] = createSignal<AuthorizedUser | null>(null);

    // here, define the reload function, call it for initial load props/discard stale token (in OnMount),
    // then provide the reload function (along with user props) in the AuthorizedUser object to children

    onMount(() => {
        authCheck()
            .then(authorized => {
                console.log(authorized)
                if (authorized) {
                    const tokenString = localStorage.getItem('authToken')
                    if (!tokenString) return;
                    const token = decodeJwt(tokenString) as { id: string };
                    console.log(token)
                    fetchUser(token.id).then(
                        u => {
                            setAuthorizedUser({ ...u });
                        });
                }
            })
    })

    return (
        <AuthContext.Provider value={{getAuthorizedUser}}>
            {props.children}
        </AuthContext.Provider>
    );
}