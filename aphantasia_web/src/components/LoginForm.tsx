import { createSignal, useContext } from "solid-js"
import { api_postLogin } from "../api/postLogin"
import { AuthContext } from "../contexts/authContext";
import { StoreContext } from "../contexts/storeContext";
import css from "../styles/components/loginForm.module.css";
import '../styles/common/htmlControls.css';
import css_buttons from '../styles/common/buttons.module.css';

export const LoginForm = () => {
    const auth = useContext(AuthContext)!;
    const store = useContext(StoreContext)!;

    const [usernameOrMail, setUsernameOrMail] = createSignal("");
    const [password, setPassword] = createSignal("");


    const handleLogin = () => {
        api_postLogin(usernameOrMail(), password())
            .then(token => {
                auth.setTokenAndReload(token);
                window.location.reload();
            })
            .catch(e => store.set('screenMessages', [...store.get.screenMessages, { color: 'red', text: e }]));
    }

    return <div class={css.login_form_container}>
        <label>Username or Email<input type='text'
            value={usernameOrMail()}
            on:change={e => setUsernameOrMail(e.target.value)}
        ></input></label>
        <br />
        <label>Password<input type='password'
            value={password()}
            on:change={e => setPassword(e.target.value)}
        ></input></label>
        <button class={css_buttons.common_button} on:click={() => handleLogin()}>Log in</button>
    </div>
}