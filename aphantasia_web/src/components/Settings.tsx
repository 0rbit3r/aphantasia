import { createSignal, onMount, Show, useContext } from 'solid-js';
import '../styles/common/htmlControls.css';
import css from '../styles/components/settings.module.css';
import css_buttons from '../styles/common/buttons.module.css';
import { StoreContext } from '../contexts/storeContext';
import { AuthContext } from '../contexts/authContext';
import { api_fetchUserSettings, api_postUserSettings } from '../api/api_userSettings';
import { handleForwardExploration } from '../stateManager/handleForwardExploration';
import { api_fetchUserProfile } from '../api/fetchUserProfile';
import { updateGrafikaNodes } from '../utility/updateGrafikaNodes';
import { convertThoughtsToNodes } from '../utility/thoughtToNodeConvertor';
import { getEdgesFromNodes } from '../utility/edgesFromThoughts';

export const Settings = () => {
    const store = useContext(StoreContext)!;
    const authContext = useContext(AuthContext)!;
    const [color, setColor] = createSignal('');
    const [bio, setBio] = createSignal('');

    onMount(() => {
        store.set('contextDataLoading', true);
        setColor(authContext.getAuthorizedUser()?.color ?? '#eeeeee');
        api_fetchUserSettings(authContext.getAuthorizedUser()?.id ?? '')
            .then(fetchedSettings => {
                setBio(fetchedSettings.bio);
                setColor(fetchedSettings.color);
            })
            .finally(() =>
                store.set('contextDataLoading', false)
            )
    })

    const bioContentLength = () => bio().length;

    const handleSave = () => api_postUserSettings({ bio: bio(), color: color(), userId: authContext.getAuthorizedUser()?.id ?? '' })
        .then(_ => {
            store.set('screenMessages', prev => [...prev, { color: 'green', text: 'Settings saved' }]);
            authContext.reload();
            store.get.grafika.focusOn(null);
            store.get.grafika.removeData(store.get.grafika.getData(), () => {
                if (!store.get.user) return;
                api_fetchUserProfile(store.get.user.id)
                    .then(profile => {
                        updateGrafikaNodes(store.get.grafika, convertThoughtsToNodes(profile.thoughts), getEdgesFromNodes(profile.thoughts),
                            () => {
                                store.get.grafika.focusOn('all');
                            });
                    })
                    .catch(e => console.error(e))
                    .finally(() => store.set('contextDataLoading', false));
            });
        })
        .catch(e =>
            store.set('screenMessages', prev => [...prev, { color: 'red', text: e }])
        )


    return <Show when={authContext.getAuthorizedUser()}>
        <div class={css.settings_container}>
            <div class={css.settings_content_container}>
                <h2 class={css.username} style={{ color: color() }}
                    on:click={() => handleForwardExploration(store,
                        { mode: 'profile', focus: authContext.getAuthorizedUser()?.id })}
                >{authContext.getAuthorizedUser()?.username}</h2>
                <div class={css.settings_section}>
                    <div class={css.color_picker_container}>
                        <div class={css.label}>Color</div>
                        <input class={css.color_text_input} type='text' value={color()} on:change={e => setColor(e.target.value)} />
                        <input class={css.color_input} type='color' value={color()} on:change={e => setColor(e.target.value)} />
                    </div>
                </div>
                <div class={css.settings_section + ' ' + css.bio_section}>
                    <div class={css.label}>Bio</div>
                    <textarea class={css.bio_input}
                        value={bio()} on:input={e => setBio(e.target.value)}></textarea>
                    <div class={css.char_counter}>{bioContentLength()} / 1000</div>
                </div>
            </div>
            <div class={css.button_bar}>
                <button class={`${css.button_bar_button} ${css_buttons.common_button}`}
                    on:click={() => { localStorage.removeItem('authToken'); location.reload() }}>Log out</button>
                <button class={`${css.button_bar_button} ${css_buttons.common_button}`}
                    on:click={handleSave}
                >Save</button>
            </div>
        </div>
    </Show>
}