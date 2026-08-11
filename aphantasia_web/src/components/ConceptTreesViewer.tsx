import { For, Show, useContext } from "solid-js";
import { StoreContext } from "../contexts/storeContext";
import css from "../styles/components/conceptViewer.module.css";
import { ConceptCard } from "./ConceptCard";

export const ConceptTreesViewer = () => {
    const store = useContext(StoreContext)!;

    return <Show when={!store.get.contextDataLoading}>
        <div class={css.concept_viewer_container}>
            <div class={css.scroll_container}>
                <For each={store.get.contextConceptList}>
                    {(c) => <ConceptCard concept={c} />}
                </For>
            </div>
        </div>
    </Show>
}
