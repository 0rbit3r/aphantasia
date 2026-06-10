import css from '../../styles/components/modeMenu.module.css'
import { SymbolButton } from '../SymbolButton'
import { createEffect, createSignal, Show, useContext } from 'solid-js';
import { AuthContext } from '../../contexts/authContext';
import { StoreContext } from '../../contexts/storeContext';
import { handleForwardExploration } from '../../stateManager/handleForwardExploration';
import type { ExplorationStateDescriptor } from '../../stateManager/explorationMode';
import welcomeIcon from '../../assets/icons/home.svg';
import epochIcon from '../../assets/icons/galaxy.svg';
import createIcon from '../../assets/icons/create_thought.svg';
import settingsIcon from '../../assets/icons/settings.svg';
import notificationsIcon from '../../assets/icons/envelope.svg';
// import bookmarksIcon from '../../assets/icons/bookmarks.svg';
import conceptsIcon from '../../assets/icons/concepts.svg';
import chatIcon from '../../assets/icons/chat.svg';
import { getCurrentExpState } from '../../stateManager/getCurrentExpState';
import { EpochPseudoId } from '../../model/dto/epoch';
// import dieIcon from '../../assets/icons/die.svg';

export const ModeMenu = () => {
    const authContext = useContext(AuthContext);
    const store = useContext(StoreContext)!;

    const [visible, setVisible] = createSignal(false);
    const [faded, setFaded] = createSignal(true);

    const navigateFromChat = (target: ExplorationStateDescriptor) => {
        if (getCurrentExpState(store).mode === 'chat')
            handleForwardExploration(store, { mode: 'epoch', focus: String(EpochPseudoId.LATEST_CONTEXT) });
        handleForwardExploration(store, target);
    };

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
        <div class={`${css.mode_menu_container} ${faded() ? css.mode_menu_container_hidden : ''}`}
            on:click={() => store.set('modeMenuOpen', false)}>
            <div class={css.buttons_container}>
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
                            <SymbolButton img={epochIcon} action={() => handleForwardExploration(store, { mode: 'epoch', focus: String(EpochPseudoId.LATEST_CONTEXT) })}></SymbolButton>
                            Epochs</div>
                        <div class={css.button_container}>
                            <SymbolButton img={notificationsIcon} action={() => navigateFromChat({ mode: 'inbox' })}></SymbolButton>
                            Inbox</div>
                        {/*<div class={css.button_container}>
                        <SymbolButton img={bookmarksIcon} action={() => { }}></SymbolButton>
                        Bookmarks</div> */}
                        <div class={css.button_container}>
                            <SymbolButton img={createIcon} action={() => navigateFromChat({ mode: 'create' })} />
                            Write</div>
                        <div class={css.button_container}>
                            <SymbolButton img={conceptsIcon} action={() => navigateFromChat({ mode: 'concept' })}></SymbolButton>
                            Concepts</div>
                        <div class={css.button_container}>
                            <SymbolButton img={settingsIcon} action={() => handleForwardExploration(store, { mode: 'settings' })}></SymbolButton>
                            Settings</div>
                        <div class={css.button_container}>
                            <SymbolButton img={chatIcon} action={() => handleForwardExploration(store, { mode: 'chat' })}></SymbolButton>
                            Chat</div>
                        {/* <div class={css.button_container}>
                        <SymbolButton img={dieIcon} action={() => { }}></SymbolButton>
                        Random</div> */}
                    </>
                </Show>
            </div>
        </div>
    </Show >
}