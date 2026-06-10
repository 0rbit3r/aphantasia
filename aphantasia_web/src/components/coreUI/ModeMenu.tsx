import css from '../../styles/components/modeMenu.module.css'
import { SymbolButton } from '../SymbolButton'
import { createEffect, createSignal, Show, useContext } from 'solid-js';
import { AuthContext } from '../../contexts/authContext';
import { StoreContext } from '../../contexts/storeContext';
import { handleForwardExploration } from '../../stateManager/handleForwardExploration';
import { MODE_CONTRACTS } from '../../stateManager/modes/modeContract';
import { EpochPseudoId } from '../../model/dto/epoch';
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
        <div class={`${css.mode_menu_container} ${faded() ? css.mode_menu_container_hidden : ''}`}
            on:click={() => store.set('modeMenuOpen', false)}>
            <div class={css.buttons_container}>
                <Show when={authContext.getAuthorizedUser() === null}>
                    <>
                        <div class={css.button_container}>
                            <SymbolButton img={MODE_CONTRACTS['welcome'].iconMenu!} action={() => handleForwardExploration(store, { mode: 'welcome' })}></SymbolButton>
                            Welcome</div>
                        <Show when={store.get.grafika.getData().nodes.find(n => n.id === 'let_us_create_a_thought')}>
                            <div class={css.button_container}>
                                <SymbolButton img={MODE_CONTRACTS['welcome_create'].iconMenu!} action={() => handleForwardExploration(store, { mode: 'welcome_create' })} />
                                Write</div>
                        </Show>
                    </>
                </Show>
                <Show when={authContext.getAuthorizedUser() !== null}>
                    <>
                        <div class={css.button_container}>
                            <SymbolButton img={MODE_CONTRACTS['epoch'].iconMenu!} action={() => handleForwardExploration(store, { mode: 'epoch', focus: String(EpochPseudoId.LATEST_CONTEXT) })}></SymbolButton>
                            Epochs</div>
                        <div class={css.button_container}>
                            <SymbolButton img={MODE_CONTRACTS['inbox'].iconMenu!} action={() => handleForwardExploration(store, { mode: 'inbox' })}></SymbolButton>
                            Inbox</div>
                        {/*<div class={css.button_container}>
                        <SymbolButton img={bookmarksIcon} action={() => { }}></SymbolButton>
                        Bookmarks</div> */}
                        <div class={css.button_container}>
                            <SymbolButton img={MODE_CONTRACTS['create'].iconMenu!} action={() => handleForwardExploration(store, { mode: 'create' })} />
                            Write</div>
                        <div class={css.button_container}>
                            <SymbolButton img={MODE_CONTRACTS['concept'].iconMenu!} action={() => handleForwardExploration(store, { mode: 'concept' })}></SymbolButton>
                            Concepts</div>
                        <div class={css.button_container}>
                            <SymbolButton img={MODE_CONTRACTS['settings'].iconMenu!} action={() => handleForwardExploration(store, { mode: 'settings' })}></SymbolButton>
                            Settings</div>
                        <div class={css.button_container}>
                            <SymbolButton img={MODE_CONTRACTS['chat'].iconMenu!} action={() => handleForwardExploration(store, { mode: 'chat' })}></SymbolButton>
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
