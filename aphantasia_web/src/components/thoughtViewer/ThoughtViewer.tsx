import { Content } from "./Content";
import css from "../../styles/components/thoughtViewer.module.css";
import { createEffect, createSignal, Show, useContext } from "solid-js";
// import { SymbolButton } from "../SymbolButton";
// import bookmarkIcon from '../../assets/icons/bookmark.svg';
// import paperPlaneIcon from '../../assets/icons/paper_plane.png';
// import bracketsIcon from '../../assets/icons/brackets_scribble.svg';
import trashIcon from '../../assets/icons/trash.png';
import { StoreContext } from "../../contexts/storeContext";
import { handleForwardExploration } from "../../stateManager/handleForwardExploration";
import { getCurrentExpState } from "../../stateManager/getCurrentExpState";
import { ScreenOrientation } from "../../contexts/screenOrientationContext";
import { RepliesScroller } from "./RepliesScroller";
import { SymbolButton } from "../SymbolButton";
import { api_deleteThought } from "../../api/deleteThought";
import { navigateBack } from "../../stateManager/backAndForward";


export const ThoughtViewer = () => {
    const store = useContext(StoreContext)!;
    const scrOrientation = useContext(ScreenOrientation)!;
    let contentContainerRef!: HTMLDivElement;

    const [tripleDeleteTap, setTripleDeleteTap] = createSignal(0);

    createEffect(() => {
        if (contentContainerRef && store.get.contextThought?.id) { //id because of former reactivity enforcement -> todo try without
            contentContainerRef.scrollTop = 0;
        }
    })

    const handleDelete = () => {
        if (tripleDeleteTap() === 0) store.set('screenMessages',
            prev => [...prev, { color: 'yellow', text: 'Tap the delete button two more times to delete this thought.' }])
        if (tripleDeleteTap() === 1) store.set('screenMessages',
            prev => [...prev, { color: 'red', text: 'Are you sure to delete this thought?' }])
        if (tripleDeleteTap() === 2 && store.get.contextThought?.id) { 
            store.set('contextDataLoading', true);
            api_deleteThought(store.get.contextThought?.id)
                .then(_ => {
                    store.get.grafika.removeData({ nodes: [{ id: store.get.contextThought?.id ?? '' }] });
                    navigateBack(store);
                    store.set('screenMessages',
                        prev => [...prev, { color: 'green', text: 'Thought deleted' }])
                })
                .catch(e => {
                    store.set('screenMessages',
                        prev => [...prev, { color: 'red', text: e }])
                })
                .finally(()=>store.set('contextDataLoading', false));
        }

        setTripleDeleteTap(prev => prev + 1);
    }

    createEffect(() => {
        if (store.get.contextThought?.id)
            setTripleDeleteTap(0);
    })

    return <div class={css.thought_viewer_container}>
        <Show when={!store.get.contextDataLoading
            && store.get.contextThought}>
            <div class={css.content_container} ref={contentContainerRef}>
                <Content
                    text={store.get.contextThought?.content ?? ''}
                    color={store.get.contextThought?.color ?? ''}
                    thoughtColors={store.get.contextThought ? new Map(store.get.contextThought.links.map(l => [l.id, l.color])) : undefined}
                    onThoughtLinkClick={id => handleForwardExploration(store, { mode: getCurrentExpState(store).mode, focus: id })}
                />
            </div>
            <div class={css.metadata_bar}>
                <div class={css.date}>{store.get.contextThought?.date}</div>
                <div class={css.author} style={{ color: store.get.contextThought?.author.color ?? '#eeeeee' }}>
                    {store.get.contextThought?.author.username}</div>
            </div>
            <RepliesScroller />
            <div class={`${css.action_buttons_bar} ${(!store.get.user?.id || (!scrOrientation.isLandscape() && store.get.splitUiLayout !== 'content')) ? css.action_buttons_bar_collapsed : ''}`}>
                <Show when={store.get.user?.id === store.get.contextThought?.author.id}>
                    <div class={css.action_buttons_bar_button}><SymbolButton
                        action={handleDelete}
                        img={trashIcon} /></div>
                </Show>
                {/* <div class={css.action_buttons_bar_button}>
                    <SymbolButton img={bracketsIcon} action={() => { }} /></div> */}
                {/* <SymbolButton action={() => { }} img={bookmarkIcon} /> */}
                {/* <SymbolButton action={() => { }} img={paperPlaneIcon} /> */}
            </div>
        </Show>
    </div>
}