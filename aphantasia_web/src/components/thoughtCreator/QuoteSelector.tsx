import { createSignal, onCleanup, onMount, Show, useContext } from "solid-js";
import { StoreContext } from "../../contexts/storeContext";
import type { Thought } from "../../model/dto/thought";
import { api_fetchThought } from "../../api/fetchThought";
import { Content } from "../thoughtViewer/Content";
import buttonCss from '../../styles/common/buttons.module.css';
import css from '../../styles/components/quoteSelector.module.css';

export const QuoteSelector = (props: { thoughtId: string, onSelected: (text: string) => void }) => {
    const store = useContext(StoreContext)!;

    const [selection, setSelection] = createSignal("");
    const [thought, setThought] = createSignal<Thought | undefined>(undefined)

    const handler = () => setSelection(window.getSelection()?.toString() ?? '');
    onMount(() => {
        document.addEventListener('selectionchange', handler);
        api_fetchThought(props.thoughtId).then(t => setThought(t));
    });
    onCleanup(() => document.removeEventListener('selectionchange', handler));

    const handleConfirm = () => {
        if (selection().length === 0) {
            store.set('screenMessages', prev => [...prev, { color: 'yellow', text: 'Select a text to quote.' }])
            return;
        }
        props.onSelected('> ' + selection().replaceAll('\n', ' ').replaceAll('[', '(').replaceAll(']', ')'));
    }

    return (
        <div class={css.quote_selector_container}>
            <div class={css.content_container}>
                <Show when={thought()}>
                    <Content
                        text={thought()?.content ?? "<Could not fetch thought, please click cancel and try again>"}
                        color={thought()?.color ?? ''}
                        thoughtColors={thought() ? new Map(thought()!.links.map(l => [l.id, l.color])) : undefined}
                    />
                </Show>
            </div>
            <button class={`${buttonCss.common_button}`} onClick={handleConfirm}>Confirm</button>
        </div>
    );
}