import { createSignal, Match, onMount, Show, Switch, useContext } from "solid-js"
import { StoreContext } from "../../contexts/storeContext"
import buttonCss from '../../styles/common/buttons.module.css';
import css from '../../styles/components/linkAdder.module.css';
import { handleForwardExploration } from "../../stateManager/handleForwardExploration";
import { getCurrentExpState } from "../../stateManager/getCurrentExpState";
import type { ThoughtTitle } from "../../model/dto/thought";
import { QuoteSelector } from "./QuoteSelector";



export const LinkAdder = (props: {
    onLinkSelected: (thought: ThoughtTitle, text: string) => void,
}) => {

    const store = useContext(StoreContext)!;
    const [thoughtToLink, setThoughtToLink] = createSignal<ThoughtTitle | null>(null);
    const [customText, setCustomText] = createSignal<string>('');

    onMount(() => {
        const grafika = store.get.grafika
        grafika.interactionEvents.all.clear();
        grafika.interactionEvents.on('nodeClicked', clickedNode => {
            if (clickedNode.id === 'created_thought') {
                store.set('screenMessages', prev => [...prev, { color: 'yellow', text: 'A thought cannot reply to itself' }]);
                return;
            }
            if (store.get.contextThoughtInMaking?.links.find(l => l.id === clickedNode.id)) {
                store.set('screenMessages', prev => [...prev, {
                    color: 'yellow', text: 'This thought is already linked'
                }])
                return;
            }
            // if tutorial...
            setThoughtToLink({ id: clickedNode.id, color: clickedNode.color, shape: clickedNode.shape, title: clickedNode.text });
            if (getCurrentExpState(store).mode === 'welcome_create') {
                handleLinkSelected(thoughtToLink()!, thoughtToLink()!.title);
                return;
            }
            grafika.focusOn(clickedNode);
            store.set('contextThoughtInMaking', { ...store.get.contextThoughtInMaking, linkSelectionState: 'type-select' })
            if (store.get.splitUiLayout === 'graph') store.set('splitUiLayout', 'half');
        })
        grafika.interactionEvents.on('viewportMoved', _ => {
            grafika.focusOn(null);
        });
    });

    const disposeLinkAdder = () => {
        const grafika = store.get.grafika;
        grafika.interactionEvents.all.clear();
        grafika.interactionEvents.on('viewportMoved', () => { grafika.focusOn(null) });
        grafika.interactionEvents.on('nodeClicked', node => {
            handleForwardExploration(store, {
                mode: getCurrentExpState(store).mode === 'welcome_create' ? 'welcome' : 'explore',
                focus: node.id
            });
        });

        grafika.focusOn({ id: 'created_thought' });

        store.set('contextThoughtInMaking', 'linkSelectionState', 'hidden');
    }

    const handleCustomTextConfirm = () => {
        if (customText().length === 0) {
            store.set('screenMessages', prev => [...prev, { text: 'The text cannot be empty', color: 'yellow' }]);
            return;
        }
        if (customText().includes('[') || customText().includes(']')) {
            store.set('screenMessages', prev => [...prev, { text: 'The text cannot contain symbols [ and ]', color: 'yellow' }]);
            return;
        }
        const selectedThought = thoughtToLink();
        if (!selectedThought) return;

        handleLinkSelected(selectedThought, customText());
    }

    const handleLinkSelected = (thought: ThoughtTitle, text: string) => {
        disposeLinkAdder();
        props.onLinkSelected(thought, text);
    }

    return <div class={css.link_adder_container}>
        <Switch>
            <Match when={store.get.contextThoughtInMaking?.linkSelectionState === 'link-menu'}>
                <>
                    <Show when={getCurrentExpState(store).mode === 'welcome_create'}>
                        <p class={css.hint}>Click a thought in the graph view to form a link.</p>
                    </Show>
                    <Show when={getCurrentExpState(store).mode !== 'welcome_create'}>
                        <p class={css.hint}>Click a thought in the graph view to link it in yours.</p>
                        {/* <button class={buttonCss.common_button}>
                            Bookmarks (todo)
                        </button>
                        <button class={buttonCss.common_button}>
                            Mine (todo)
                        </button> */}
                    </Show>
                </>
            </Match>
            <Match when={store.get.contextThoughtInMaking?.linkSelectionState === 'type-select'}>
                <>
                    <p class={css.hint}>Select how to display the link:</p>
                    <button class={buttonCss.common_button}
                        on:click={() => handleLinkSelected(thoughtToLink()!, thoughtToLink()!.title)}>
                        Original Title
                    </button>
                    <button class={buttonCss.common_button}
                        on:click={() => store.set('contextThoughtInMaking', 'linkSelectionState', 'quote')}>
                        Quote
                    </button>
                    <button class={buttonCss.common_button}
                        on:click={() => store.set('contextThoughtInMaking', 'linkSelectionState', 'custom-text')}>
                        Custom
                    </button>
                </>
            </Match>
            <Match when={store.get.contextThoughtInMaking?.linkSelectionState === 'custom-text'}>
                <>
                    <p class={css.hint}>What will the link say?</p>
                    <input type='text-area' value={customText()} on:input={e => setCustomText(e.target.value)}></input>
                    <button class={buttonCss.common_button} on:click={handleCustomTextConfirm}>Confirm</button>
                </>
            </Match>
            <Match when={store.get.contextThoughtInMaking?.linkSelectionState === 'quote'}>
                <QuoteSelector thoughtId={thoughtToLink()!.id} onSelected={(text) => handleLinkSelected(thoughtToLink()!, text)} />
            </Match>
        </Switch>
        <button class={buttonCss.common_button}
            on:click={disposeLinkAdder}>
            Cancel
        </button>
    </div>

}