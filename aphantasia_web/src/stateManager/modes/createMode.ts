import { NodeShape, type ProxyNode } from "grafika";
import { handleForwardExploration } from "../handleForwardExploration";
import type { ModeContract } from "./modeContract";

export const CreateMode = {
    grafikaInitType: 'main',

    initialize: (store) => {
        store.get.grafika.interactionEvents.on('nodeClicked', (clickedNode: ProxyNode) => {
            if (clickedNode.id === 'created_thought') {
                store.get.grafika.focusOn({ id: 'created_thought' });
                return;
            }
            handleForwardExploration(store, {
                mode: 'explore',
                focus: clickedNode.id
            });
        });
        store.get.grafika.interactionEvents.on('viewportMoved', () => { store.get.grafika.focusOn(null) });

        const color = store.get.user?.color ?? '#cccccc';
        const viewport = store.get.grafika.getViewport();

        store.get.grafika.addData({
            nodes: [{ id: 'created_thought', glowEffect: true, radius: 50,
                text: store.get.contextThoughtInMaking?.title ?? '',
                shape: store.get.contextThoughtInMaking?.shape ?? NodeShape.Circle,
                color: color,
                x: viewport.position.x, y: viewport.position.y
             }]
        })

        console.log(store.get.grafika.getData());

        store.get.grafika.focusOn({ id: 'created_thought' });

        store.set('splitUiLayout', 'half');
        if (!store.get.contextThoughtInMaking)
            store.set('contextThoughtInMaking', {
                title: '',
                concepts: [],
                content: '',
                links: [],
                shape: 0,
                linkSelectionState: 'hidden',
                cursorPosition: 0,
                color: color
            });
        else
            store.set('contextThoughtInMaking', 'linkSelectionState', 'hidden');
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

} satisfies ModeContract