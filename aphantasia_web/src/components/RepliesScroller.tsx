import { For, Show, useContext } from "solid-js";
import type { Thought } from "../model/dto/thought"
import css from '../styles/components/repliesScroller.module.css';
import { AphantasiaStoreContext } from "../contexts/aphantasiaStoreContext";
import { handleForwardExploration } from "../stateManager/handleForwardExploration";



export const RepliesScroller = () => {
    const store = useContext(AphantasiaStoreContext)!;
    let scrollerRef: HTMLDivElement | undefined;

    const handleWheel = (e: WheelEvent) => {
        if (e.deltaY !== 0) {
            e.preventDefault();
            scrollerRef!.scrollLeft += e.deltaY;
        }
    };
    return <div
        class={css.horizontal_scroller_container}
        ref={scrollerRef}
        onWheel={handleWheel}
    >
        <Show when={(store?.get.contextData as Thought)?.replies?.length === 0}>
            <div class={css.no_replies}>No replies yet</div>
        </Show>
        <For each={(store?.get.contextData as Thought)?.replies}>
            {reply => <div
                class={css.reply_box}
                style={{ border: `2px solid ${reply.color}`, "background-color": `${reply.color}30` }}
                on:click={() => handleForwardExploration(store, { mode: "welcome", focus: reply.id })}
            // todo - reples and links might sometimes need to decide whether to switch to exploration mode...
            >
                {reply.title}</div>}
        </For>
    </div>
}