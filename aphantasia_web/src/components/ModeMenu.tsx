import css from '../styles/components/modeMenu.module.css'
import { SymbolButton } from './SymbolButton'
import homeIcon from '../assets/icons/home.svg';
import epochIcon from '../assets/icons/galaxy.svg';
import bellIcon from '../assets/icons/envelope.svg';
import bookmarksIcon from '../assets/icons/bookmarks.svg';
import createIcon from '../assets/icons/create_thought.svg';
import conceptsIcon from '../assets/icons/concepts.png';
import settingsIcon from '../assets/icons/settings.png';
import chatIcon from '../assets/icons/chat.png';
import dieIcon from '../assets/icons/die.svg';
import { createEffect, createSignal, Show, useContext } from 'solid-js';
import { AuthContext } from '../contexts/authContext';
import { getCurrentExpState } from '../stateManager/getCurrentExpState';
import { AphantasiaStoreContext } from '../contexts/aphantasiaStoreContext';
import { handleForwardExploration } from '../stateManager/handleForwardExploration';

export const ModeMenu = () => {
    const authContext = useContext(AuthContext);
    const store = useContext(AphantasiaStoreContext)!;

    const [visible, setVisible] = createSignal(false);
    const [faded, setFaded] = createSignal(true);

    createEffect(() => {
        if (store.get.modeMenuOpen === false) {
            setFaded(true);
            setTimeout(() => setVisible(false), 300)
        }
        else {
            setVisible(true);
            setTimeout(()=>setFaded(false), 10);
        }
    })

    return <Show when={visible()}>
        <div class={`${css.mode_menu_container} ${faded() ? css.mode_menu_container_hidden : ''}`}>
            <div class={css.buttons_container}
                on:click={() => store.set('modeMenuOpen', false)}>
                <div class={css.button_container}>
                    <SymbolButton img={homeIcon} action={() => handleForwardExploration(store, { mode: 'welcome' })}></SymbolButton>
                    Home</div>
                {(!authContext.getAuthorizedUser() === null) && <>
                    <div class={css.button_container}>
                        <SymbolButton img={epochIcon} action={() => { }}></SymbolButton>
                        Epochs</div>
                    <div class={css.button_container}>
                        <SymbolButton img={bellIcon} action={() => { }}></SymbolButton>
                        Replies</div>
                    <div class={css.button_container}>
                        <SymbolButton img={bookmarksIcon} action={() => { }}></SymbolButton>
                        Bookmarks</div>
                </>}
                <div class={css.button_container}>
                    <SymbolButton img={createIcon} action={() => {
                        if (getCurrentExpState(store).mode.includes('welcome')) {
                            handleForwardExploration(store, { mode: 'welcome_create' });
                        } else {
                            handleForwardExploration(store, { mode: 'create' })
                        }
                    }}></SymbolButton>
                    Write</div>
                {(!authContext.getAuthorizedUser() === null) && <>
                    <div class={css.button_container}>
                        <SymbolButton img={conceptsIcon} action={() => { }}></SymbolButton>
                        Concepts</div>
                    <div class={css.button_container}>
                        <SymbolButton img={settingsIcon} action={() => { }}></SymbolButton>
                        Settings</div>
                    <div class={css.button_container}>
                        <SymbolButton img={chatIcon} action={() => { }}></SymbolButton>
                        Chat</div>
                    <div class={css.button_container}>
                        <SymbolButton img={dieIcon} action={() => { }}></SymbolButton>
                        Random</div>
                </>}
            </div>
        </div>
    </Show>
}