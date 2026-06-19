import { Content } from "./Content";
import css from "../../styles/components/thoughtViewer.module.css";
import { createEffect, createSignal, Show, useContext } from "solid-js";
// import bookmarkIcon from '../../assets/icons/bookmark.svg';
// import paperPlaneIcon from '../../assets/icons/paper_plane.png';
import bracketsIcon from '../../assets/icons/brackets_scribble.svg';
import trashIcon from '../../assets/icons/trash.png';
import { NodeShape } from "grafika";
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
                .finally(() => store.set('contextDataLoading', false));
        }

        setTripleDeleteTap(prev => prev + 1);
    }

    createEffect(() => {
        if (store.get.contextThought?.id)
            setTripleDeleteTap(0);
    })

    const handleQuickReply = () => {
        const thought = store.get.contextThought;
        if (!thought) return;
        const conceptList = thought.concepts
            .map(c => c.tag)
            .filter(tag => !thought.concepts.some(cObj => cObj.tag !== tag && cObj.tag.startsWith(tag)))
            .join(' ');

        const concepts = thought.concepts.map(c => c.tag);
        const link = { id: thought.id, title: thought.title, color: thought.color, shape: thought.shape };
        const re = `[${thought.id}][Re: ${thought.title}]`;
        if (!store.get.contextThoughtInMaking) {
            store.set('contextThoughtInMaking', {
                title: '',
                content: `${re}\n\n\n\n${conceptList}`,
                links: [link],
                concepts,
                shape: NodeShape.Circle,
                color: store.get.user?.color ?? '#cccccc',
                cursorPosition: 0,
                linkSelectionState: 'hidden',
                previewMode: false,
            });
        } else {
            store.set('contextThoughtInMaking', 'content', prev => `${re}\n${prev}\n\n${conceptList}`);
            store.set('contextThoughtInMaking', 'links', [link]);
        }
        handleForwardExploration(store, { mode: 'create' });
    }

    return <div class={css.thought_viewer_container}>
        <Show when={!store.get.contextDataLoading
            && store.get.contextThought}>
            <div class={css.content_container} ref={contentContainerRef}>
                <Content
                    text={store.get.contextThought?.content ?? ''}
                    color={store.get.contextThought?.color ?? ''}
                    thoughtColors={store.get.contextThought ? new Map(store.get.contextThought.links.map(l => [l.id, l.color])) : undefined}
                    onThoughtLinkClick={id => handleForwardExploration(store, { mode: getCurrentExpState(store).mode, focus: id })}
                    onConceptLinkClick={(tag) =>
                        getCurrentExpState(store).mode.startsWith('welcome')
                            ? null
                            : handleForwardExploration(store, { mode: 'concept', focus: tag })}
                    conceptColors={store.get.contextThought ? new Map(store.get.contextThought.concepts.map(c => [c.tag, c.color])) : undefined}
                />
            </div>
            <div class={css.metadata_bar}>
                <div class={css.date}
                    on:click={() => (getCurrentExpState(store).mode !== 'welcome') && handleForwardExploration(store, { mode: 'epoch', focus: store.get.contextThought?.epochId?.toString() ?? '-1' })}>
                    {store.get.contextThought?.date}</div>
                <div class={css.author} style={{ color: store.get.contextThought?.author.color ?? '#eeeeee' }}
                    on:click={() => (getCurrentExpState(store).mode !== 'welcome') && handleForwardExploration(store, { mode: 'profile', focus: store.get.contextThought?.author.id })}>
                    {store.get.contextThought?.author.username}</div>
            </div>
            <div class={`${css.replies_container} ${((!scrOrientation.isLandscape() && store.get.splitUiLayout !== 'content')) ? css.replies_container_collapsed : ''}`}>
                <RepliesScroller replyClicked={id => {console.log(id);
                    return getCurrentExpState(store).mode.startsWith('welcome') 
                        ? handleForwardExploration(store, { mode: 'welcome', focus: id })
                        : handleForwardExploration(store, { mode: getCurrentExpState(store).mode, focus: id })}} />
            </div>
            <Show when={store.get.user?.id}>
                <div class={css.action_buttons_bar}>
                    <Show when={store.get.user?.id === store.get.contextThought?.author.id}>
                        <div class={css.action_buttons_bar_button}><SymbolButton
                            action={handleDelete}
                            img={trashIcon} /></div>
                    </Show>
                    <Show when={store.get.user}>
                        <div class={css.action_buttons_bar_button}>
                            <SymbolButton img={bracketsIcon} action={handleQuickReply} /></div>
                    </Show>
                    {/* <SymbolButton action={() => { }} img={bookmarkIcon} /> */}
                    {/* <SymbolButton action={() => { }} img={paperPlaneIcon} /> */}
                </div>
            </Show>
        </Show>
    </div>
}