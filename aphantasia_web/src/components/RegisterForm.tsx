import { createEffect, createSignal, useContext } from "solid-js"
import { StoreContext } from "../contexts/storeContext";
import css from "../styles/components/registerForm.module.css";
import '../styles/common/htmlControls.css';
import css_buttons from '../styles/common/buttons.module.css';
import { api_postRegister } from "../api/postRegister";
import { handleForwardExploration } from "../stateManager/handleForwardExploration";

const [username, setUsername] = createSignal("");
const [email, setEmail] = createSignal("");
const [password, setPassword] = createSignal("");
const [passwordConfirm, setPasswordConfirm] = createSignal("");

export const RegisterForm = () => {
    const store = useContext(StoreContext)!;


    const [validations, setValidations] = createSignal<Problem[]>([]);

    createEffect(() => {
        const newValidations: Problem[] = [];
        if (!validateUsernameLength(username())) newValidations.push('usernameLength');
        if (!validateUsernameCharacters(username())) newValidations.push('notGoodUsername');
        if (!validateEmail(email())) newValidations.push('notGoodEmail');
        if (!validatePasswordCharacters(password())) newValidations.push('notGoodPassword');
        if (!validatePasswordLength(password())) newValidations.push('passwordLength');
        if (password() !== passwordConfirm()) newValidations.push('differentPasswords');

        setValidations(newValidations);
    })

    const handleRegistration = () => {
        api_postRegister(username(), email() === '' ? undefined : email(), password())
            .then(_ => {
                store.set('screenMessages', [...store.get.screenMessages, { color: 'green', text: 'Registraion successful. You may now log in.' }]);
                setUsername('');
                setEmail('');
                setPassword('');
                setPasswordConfirm('');
                handleForwardExploration(store, {mode: 'welcome', focus: 'log_in'});
            })
            .catch(e => store.set('screenMessages', [...store.get.screenMessages, { color: 'red', text: e }]));
    }

    return <div class={css.register_form_container}>
        <label>Username<input type='text'
            value={username()}
            on:input={e => setUsername(e.target.value)}
        ></input></label>
        <br />
        <label>Email (optional)<input type='text'
            value={email()}
            on:input={e => setEmail(e.target.value)}
        ></input></label>
        <br />
        <label>Password<input type='password'
            value={password()}
            on:input={e => setPassword(e.target.value)}
        ></input></label>
        <label>Confirm password<input type='password'
            value={passwordConfirm()}
            on:input={e => setPasswordConfirm(e.target.value)}
        ></input></label>

        <label style={{ color: validations().includes('usernameLength') ? '#ff3e3e' : '#67ff67' }} >{validationMessages.usernameLength}</label>
        <label style={{ color: validations().includes('notGoodUsername') ? '#ff3e3e' : '#67ff67' }} >{validationMessages.notGoodUsername}</label>
        <label style={{ color: validations().includes('notGoodEmail') ? '#ff3e3e' : '#67ff67' }} >{validationMessages.notGoodEmail}</label>
        <label style={{ color: validations().includes('notGoodPassword') ? '#ff3e3e' : '#67ff67' }} >{validationMessages.notGoodPassword}</label>
        <label style={{ color: validations().includes('passwordLength') ? '#ff3e3e' : '#67ff67' }} >{validationMessages.passwordLength}</label>
        <label style={{ color: validations().includes('differentPasswords') ? '#ff3e3e' : '#67ff67' }} >{validationMessages.differentPasswords}</label>

        <button disabled={validations().length !== 0} class={css_buttons.common_button} on:click={() => handleRegistration()}>Register</button>
    </div>
}

type Problem = 'differentPasswords' | 'notGoodPassword' | 'passwordLength' | 'notGoodUsername' | 'notGoodEmail' | 'usernameLength';

const validationMessages: Record<Problem, string> = {
    usernameLength: '- Username must be between 3 and 20 characters long',
    notGoodUsername: '- Username can only contain letters, numbers and dashes',
    notGoodEmail: '- Email address must be valid',
    notGoodPassword: '- Password must contain: one digit, one lowercase letter, one uppercase letter',
    differentPasswords: '- Passwords must match',
    passwordLength: '- Password must be between 8 and 80 characters long'
}

const validateUsernameLength = (username: string) =>
    username.length <= 20 && username.length >= 3;

const validateUsernameCharacters = (username: string) =>
    /^[a-zA-Z0-9\-]+$/.test(username);

const validatePasswordLength = (pass: string)=>
    pass.length >= 8 && pass.length <= 80;

const validatePasswordCharacters = (pass: string) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(pass);

const validateEmail = (email: string) => 
    email==='' || /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);