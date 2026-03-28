import type { ProxyNode } from "grafika";
import { handleForwardExploration } from "../handleForwardExploration";
import type { StateContract } from "./stateContract";

export const CREATE_STATE = {
    grafikaSettings: null!,

    initialize: (store) => {
        store.get.grafika.interactionEvents.on('nodeClicked', (clickedNode: ProxyNode) => {
            if (clickedNode.id === 'created_thought'){
                store.get.grafika.focusOn({id: 'created_thought'});
                return;
            }
            handleForwardExploration(store, {
                mode: 'explore',
                focus: clickedNode.id
            });
        });
        store.get.grafika.interactionEvents.on('viewportMoved', () => { store.get.grafika.focusOn(null) });

        const color = store.get.user?.color ?? '#cccccc';

        store.get.grafika.addData({
            nodes: [{ id: 'created_thought', glowEffect: true, radius: 50, text: '', color: color }]
        })

        console.log(store.get.grafika.getData());

        store.get.grafika.focusOn({ id: 'created_thought' });

        store.set('splitUiLayout', 'half');
        if (!store.get.contextThoughtInMaking)
            store.set('contextThoughtInMaking', {
                _type: 'ThoughtInMaking',
                title: '',
                concepts: [],
                content: '',
                links: [],
                shape: 0,
                linkSelectionState: 'hidden',
                cursorPosition: 0,
                color: color
            });
    },

    hangleFocusChange: (store, _) => {
        store.get.grafika.focusOn({id: "created_thought"});
    },

    dispose: (store) => {
        store.get.grafika.removeData({
            nodes: [{ id: 'created_thought' }],
            edges: store.get.grafika.getData().edges.filter(e => e.targetId === 'created_thought')
        })
        store.get.grafika.interactionEvents.all.clear();
    }

} satisfies StateContract