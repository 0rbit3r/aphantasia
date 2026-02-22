import { Content } from "./Content";
import css from "../../styles/components/thoughtViewer.module.css";
import { createEffect, Show, useContext } from "solid-js";
import { SymbolButton } from "../SymbolButton";
import bookmarkIcon from '../../assets/icons/bookmark.png';
import trashIcon from '../../assets/icons/trash.png';
import paperPlaneIcon from '../../assets/icons/paper_plane.png';
import { AphantasiaStoreContext } from "../../contexts/aphantasiaStoreContext";
import { isThought } from "../../utility/isTypeOf";
import type { Thought } from "../../model/dto/thought";
import { handleForwardExploration } from "../../stateManager/handleForwardExploration";
import { getCurrentExpState } from "../../stateManager/getCurrentExpState";
import { RepliesScroller } from "../RepliesScroller";
import { ScreenOrientation } from "../../contexts/screenOrientationContext";


export interface ThoughtViewerProps {
}

export const ThoughtViewer = () => {
    const store = useContext(AphantasiaStoreContext)!;
    const scrOrientation = useContext(ScreenOrientation)!;
    let contentContainerRef!: HTMLDivElement;

    createEffect(()=>{
        if (isThought(store.get.contextData) && store.get.contextData.id){
            contentContainerRef.scrollTop = 0;
        }
    })

    return <div class={css.thought_viewer_container}>
        <Show when={!store.get.contextDataLoading
            && isThought(store.get.contextData)}>
            <div class={css.content_container} ref={contentContainerRef}>
                <Content
                    text={(store.get.contextData as Thought)!.content}
                    color={(store.get.contextData as Thought)!.author.color}
                    thoughtColors={isThought(store.get.contextData) ? new Map((store.get.contextData as Thought).links.map(l => [l.id, l.color])) : undefined}
                    onThoughtLinkClick={id => handleForwardExploration(store, { mode: getCurrentExpState(store).mode, focus: id })}
                />
            </div>
            <div class={css.metadata_bar}>
                <div class={css.date}>{(store.get.contextData as Thought)?.date}</div>
                <div class={css.author} style={{ color: (store.get.contextData as Thought)?.author.color ?? '#eeeeee' }}>
                    {(store.get.contextData as Thought)?.author.username}</div>
            </div>
            <RepliesScroller />
            <div class={`${css.action_buttons_bar} ${(!scrOrientation.isLandscape() && store.get.splitUiLayout !== 'content') ? css.action_buttons_bar_collapsed : ''}`}>
                <SymbolButton action={() => { }} img={<img src={trashIcon} />} />
                <SymbolButton action={() => { }} img={<img src={bookmarkIcon} />} />
                <SymbolButton action={() => { }} img={<img src={paperPlaneIcon} />} />
            </div>
        </Show>
    </div>
}