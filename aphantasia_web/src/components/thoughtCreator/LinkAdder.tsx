import { createSignal, onMount, Show, useContext } from "solid-js"
import { StoreContext } from "../../contexts/storeContext"
import css from '../../styles/components/linkAdder.module.css';
import { handleForwardExploration } from "../../stateManager/handleForwardExploration";
import { getCurrentExpState } from "../../stateManager/getCurrentExpState";
import type { ThoughtTitle } from "../../model/dto/thought";



export const LinkAdder = (props: {
    onLinkSelected: (thought: ThoughtTitle, text: string) => void,
}) => {

    const store = useContext(StoreContext)!;
    const [thoughtToLink, setThoughtToLink] = createSignal<ThoughtTitle | null>(null);

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

        store.set('contextThoughtInMaking', { ...store.get.contextThoughtInMaking, linkSelectionState: 'hidden' })
    }

    const handleLinkSelected = (thought: ThoughtTitle, text: string) => {
        disposeLinkAdder();
        props.onLinkSelected(thought, text);
    }

    return <div class={css.link_adder_container}>
        <Show when={store.get.contextThoughtInMaking?.linkSelectionState === 'link-menu'}>
            <Show when={getCurrentExpState(store).mode === 'welcome_create'}>
                <p class={css.hint}>Click a thought in the graph view to form a link.</p>
            </Show>
            <Show when={getCurrentExpState(store).mode !== 'welcome_create'}>
                <p class={css.hint}>Click a thought in the graph view or select:</p>
                <button class={css.source_button}>
                    Bookmarks (todo)
                </button>
                <button class={css.source_button}>
                    Mine (todo)
                </button>
            </Show>
        </Show>
        <Show when={store.get.contextThoughtInMaking?.linkSelectionState === 'type-select'}>
            <p class={css.hint}>Select how to display the link:</p>
            <button class={css.source_button}
                on:click={() => handleLinkSelected(thoughtToLink()!, thoughtToLink()!.title)}>
                Name
            </button>
            <button class={css.source_button}>
                Quote (todo)
            </button>
            <button class={css.source_button}>
                Custom (todo)
            </button>
        </Show>
        <button class={css.source_button}
            on:click={disposeLinkAdder}>
            Cancel
        </button>
    </div>

}