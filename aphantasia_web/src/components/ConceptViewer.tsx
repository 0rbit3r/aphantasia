import { For, Show, useContext } from "solid-js";
import { StoreContext } from "../contexts/storeContext";
import css from "../styles/components/conceptViewer.module.css";
import { ThoughtCard } from "./ThoughtCard";

export const ConceptViewer = () => {
    const store = useContext(StoreContext)!;

    return <Show when={!store.get.contextDataLoading}>
        <div class={css.concept_viewer_container}>
            <Show
                when={store.get.contextConcept}>
                <div class={css.concept_header}>
                    <div class={css.thought_count}>
                        {store.get.contextConcept!.thoughts.length} thoughts
                    </div>
                </div>
                <div class={css.scroll_container}>
                    <For each={store.get.contextConcept!.thoughts}>
                        {(t) => <ThoughtCard thought={t} />}
                    </For>
                </div>
            </Show>
        </div>
    </Show>
}
