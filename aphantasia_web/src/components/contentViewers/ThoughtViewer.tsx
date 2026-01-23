import { Content } from "./Content";
import css from "../../styles/components/thoughtViewer.module.css";
import { Show, useContext } from "solid-js";
import { SymbolButton } from "../SymbolButton";
import bookmarkIcon from '../../assets/icons/bookmark.png';
import trashIcon from '../../assets/icons/trash.png';
import paperPlaneIcon from '../../assets/icons/paper_plane.png';
import { AphantasiaStoreContext } from "../../contexts/aphantasiaStoreContext";
import { isThought } from "../../model/isTypeOf";
import type { Thought } from "../../model/thought";


export interface ThoughtViewerProps {
}

export const ThoughtViewer = () => {
    const store = useContext(AphantasiaStoreContext)!;

    return <div class={css.thought_viewer_container}>
        <Show when={!store.get.contextDataLoading
            && isThought(store.get.contextData)}>
            <div class={css.scrollable_container}>
                <Content
                    text={(store.get.contextData as Thought)!.content}
                    color={(store.get.contextData as Thought)!.author.color}
                    thoughtColors={isThought(store.get.contextData) ? new Map((store.get.contextData as Thought).links.map(l => [l.id, l.author.color])) : undefined}
                />
            </div>
            <div class={css.metadata_bar}>
                <div class={css.date}>{(store.get.contextData as Thought)?.date}</div>
                <div class={css.author} style={{ color: (store.get.contextData as Thought)?.author.color ?? '#eeeeee' }}>
                    {(store.get.contextData as Thought)?.author.name}</div>
            </div>
            <div class={css.action_buttons_bar}>
                <SymbolButton action={() => { }} img={<img src={trashIcon} />} />
                <SymbolButton action={() => { }} img={<img src={bookmarkIcon} />} />
                <SymbolButton action={() => { }} img={<img src={paperPlaneIcon} />} />
            </div>
        </Show>
    </div>
}