import { createSignal, onMount, Show, useContext } from 'solid-js';
import _ from '../styles/common/htmlControls.module.css';
import css from '../styles/components/settings.module.css';
import css_buttons from '../styles/common/buttons.module.css';
import { StoreContext } from '../contexts/storeContext';
import { AuthContext } from '../contexts/authContext';
import { api_fetchUserSettings, api_postUserSettings } from '../api/api_userSettings';

export const Settings = () => {
    const store = useContext(StoreContext)!;
    const authContext = useContext(AuthContext)!;
    const [color, setColor] = createSignal('');
    const [bio, setBio] = createSignal('');

    onMount(() => {
        setColor(authContext.getAuthorizedUser()?.color ?? '#eeeeee');
        api_fetchUserSettings(authContext.getAuthorizedUser()?.id ?? '')
            .then(fetchedSettings => {
                setBio(fetchedSettings.bio);
                setColor(fetchedSettings.color);
            })
    })


    return <Show when={!store.get.contextDataLoading
        && store.get.contextEpoch}>
        <div class={css.settings_container}>
            Color:
            <input type='color' value={color()} on:change={e => setColor(e.target.value)}></input>
            <br />
            <input type='text' value={color()} on:change={e => setColor(e.target.value)}></input>
            <br />
            <br />
            Bio
            <input type='text' value={bio()} on:change={e => setBio(e.target.value)}></input>
            <button class={css_buttons.common_button} on:click={() => {
                api_postUserSettings({ bio: bio(), color: color(), userId: authContext.getAuthorizedUser()?.id ?? '' })
                    .then(_ => {
                        store.set('notificationMessages', prev => [...prev, { color: 'green', text: 'Settings saved' }]);
                        authContext.reload();
                    })
                    .catch(e =>
                        store.set('notificationMessages', prev => [...prev, { color: 'red', text: e }])
                    )
            }}>Save</button>
            <br />
            <br />
            <button class={css_buttons.common_button} on:click={() => { localStorage.removeItem('authToken'); location.reload() }}>Log out</button>
        </div>
    </Show>
}