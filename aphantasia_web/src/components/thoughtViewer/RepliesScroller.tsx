import { For, Show, useContext } from "solid-js";
import css from '../../styles/components/repliesScroller.module.css';
import { StoreContext } from "../../contexts/storeContext";
import { handleForwardExploration } from "../../stateManager/handleForwardExploration";
import { getCurrentExpState } from "../../stateManager/getCurrentExpState";



export const RepliesScroller = () => {
    const store = useContext(StoreContext)!;
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
        <Show when={store?.get.contextThought?.replies?.length === 0}>
            <div class={css.no_replies}>No replies yet</div>
        </Show>
        <For each={store?.get.contextThought?.replies}>
            {reply => <div
                class={css.reply_box}
                style={{ border: `2px solid ${reply.color}`, "background-color": `${reply.color}30` }}
                on:click={() => handleForwardExploration(store, { mode: getCurrentExpState(store).mode, focus: reply.id })}
            // todo - reples and links might sometimes need to decide whether to switch to exploration mode...
            >
                {reply.title}</div>}
        </For>
    </div>
}