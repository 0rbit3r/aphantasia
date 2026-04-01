import css from '../../styles/components/modeMenu.module.css'
import { SymbolButton } from '../SymbolButton'
import { createEffect, createSignal, Show, useContext } from 'solid-js';
import { AuthContext } from '../../contexts/authContext';
import { StoreContext } from '../../contexts/storeContext';
import { handleForwardExploration } from '../../stateManager/handleForwardExploration';
import welcomeIcon from '../../assets/icons/home.svg';
import epochIcon from '../../assets/icons/galaxy.svg';
import createIcon from '../../assets/icons/create_thought.svg';
import settingsIcon from '../../assets/icons/settings.svg';
// import bellIcon from '../../assets/icons/envelope.svg';
// import bookmarksIcon from '../../assets/icons/bookmarks.svg';
// import conceptsIcon from '../../assets/icons/concepts.png';
// import chatIcon from '../../assets/icons/chat.png';
// import dieIcon from '../../assets/icons/die.svg';

export const ModeMenu = () => {
    const authContext = useContext(AuthContext);
    const store = useContext(StoreContext)!;

    const [visible, setVisible] = createSignal(false);
    const [faded, setFaded] = createSignal(true);

    createEffect(() => {
        if (store.get.modeMenuOpen === false) {
            setFaded(true);
            setTimeout(() => setVisible(false), 300)
        }
        else {
            setVisible(true);
            setTimeout(() => setFaded(false), 10);
        }
    })

    return <Show when={visible()}>
        <div class={`${css.mode_menu_container} ${faded() ? css.mode_menu_container_hidden : ''}`}>
            <div class={css.buttons_container}
                on:click={() => store.set('modeMenuOpen', false)}>
                <Show when={authContext.getAuthorizedUser() === null}>
                    <>
                        <div class={css.button_container}>
                            <SymbolButton img={welcomeIcon} action={() => handleForwardExploration(store, { mode: 'welcome' })}></SymbolButton>
                            Welcome</div>
                        <Show when={store.get.grafika.getData().nodes.find(n => n.id === 'let_us_create_a_thought')}>
                            <div class={css.button_container}>
                                <SymbolButton img={createIcon} action={() => handleForwardExploration(store, { mode: 'welcome_create' })} />
                                Write</div>
                        </Show>
                    </>
                </Show>
                <Show when={authContext.getAuthorizedUser() !== null}>
                    <>
                        <div class={css.button_container}>
                            <SymbolButton img={epochIcon} action={() => handleForwardExploration(store, { mode: 'epochs' })}></SymbolButton>
                            Epochs</div>
                        {/* <div class={css.button_container}>
                        <SymbolButton img={bellIcon} action={() => { }}></SymbolButton>
                        Replies</div>
                    <div class={css.button_container}>
                        <SymbolButton img={bookmarksIcon} action={() => { }}></SymbolButton>
                        Bookmarks</div> */}
                        <div class={css.button_container}>
                            <SymbolButton img={createIcon} action={() => handleForwardExploration(store, { mode: 'create' })} />
                            Write</div>
                        {/* <div class={css.button_container}>
                        <SymbolButton img={conceptsIcon} action={() => { }}></SymbolButton>
                        Concepts</div> */}
                        <div class={css.button_container}>
                            <SymbolButton img={settingsIcon} action={() => handleForwardExploration(store, { mode: 'settings' })}></SymbolButton>
                            Settings</div>
                        {/* <div class={css.button_container}>
                        <SymbolButton img={chatIcon} action={() => { }}></SymbolButton>
                        Chat</div> */}
                        {/* <div class={css.button_container}>
                        <SymbolButton img={dieIcon} action={() => { }}></SymbolButton>
                        Random</div> */}
                    </>
                </Show>
            </div>
        </div>
    </Show >
}