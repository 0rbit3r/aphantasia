import { Content } from "./Content";
import css from "../../styles/components/thoughtViewer.module.css";
import { createEffect, Show, useContext } from "solid-js";
// import { SymbolButton } from "../SymbolButton";
// import bracketsIcon from '../../assets/icons/brackets.svg';
// import bookmarkIcon from '../../assets/icons/bookmark.svg';
// import trashIcon from '../../assets/icons/trash.png';
// import paperPlaneIcon from '../../assets/icons/paper_plane.png';
import { StoreContext } from "../../contexts/storeContext";
import { handleForwardExploration } from "../../stateManager/handleForwardExploration";
import { getCurrentExpState } from "../../stateManager/getCurrentExpState";
import { ScreenOrientation } from "../../contexts/screenOrientationContext";
import { RepliesScroller } from "./RepliesScroller";


export interface ThoughtViewerProps {
}

export const ThoughtViewer = () => {
    const store = useContext(StoreContext)!;
    const scrOrientation = useContext(ScreenOrientation)!;
    let contentContainerRef!: HTMLDivElement;

    createEffect(() => {
        if (store.get.contextThought?.id) { //id because of former reactivity enforcement -> todo try without
            contentContainerRef.scrollTop = 0;
        }
    })

    return <div classList={{
        [css.thought_viewer_container]: true,
        [css.thought_viewer_container_land]: scrOrientation.isLandscape()
    }}>
        <Show when={!store.get.contextDataLoading
            && store.get.contextThought}>
            <div class={css.content_container} ref={contentContainerRef}>
                <Content
                    text={store.get.contextThought?.content ?? ''}
                    color={store.get.contextThought?.author?.color ?? ''}
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
            <div class={`${css.action_buttons_bar} ${(!scrOrientation.isLandscape() && store.get.splitUiLayout !== 'content') ? css.action_buttons_bar_collapsed : ''}`}>
                {"<Usefull buttons will be here>"}
                {/* <SymbolButton action={() => { }} img={bookmarkIcon} /> */}
                {/* <SymbolButton action={() => { }} img={bracketsIcon} /> */}
                {/* <SymbolButton action={() => { }} img={trashIcon} />
                <SymbolButton action={() => { }} img={paperPlaneIcon} /> */}
            </div>
        </Show>
    </div>
}