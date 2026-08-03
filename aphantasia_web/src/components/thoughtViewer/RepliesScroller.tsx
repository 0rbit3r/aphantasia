import { For, Show, useContext } from "solid-js";
import css from '../../styles/components/repliesScroller.module.css';
import { StoreContext } from "../../contexts/storeContext";

export const RepliesScroller = (props: {replyClicked: (id: string) => void}) => {
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
                on:click={() => props.replyClicked(reply.id)}
            >
                {reply.title}</div>}
        </For>
    </div>
}