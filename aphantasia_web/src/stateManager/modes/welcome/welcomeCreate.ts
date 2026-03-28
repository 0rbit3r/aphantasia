import type { StateContract } from "../stateContract";
import type { ProxyNode } from "grafika";
import { handleForwardExploration } from "../../handleForwardExploration";


export const WELCOME_CREATE_STATE = {
    grafikaSettings: null!,

    initialize: (store) => {
        store.get.grafika.interactionEvents.on('nodeClicked', (clickedNode: ProxyNode) => {
            handleForwardExploration(store, {
                mode: 'welcome',
                focus: clickedNode.id
            });
        });
        store.get.grafika.interactionEvents.on('viewportMoved', () => { store.get.grafika.focusOn(null) });

        const color = generateRandomColor();

        store.get.grafika.addData({
            nodes: [{ id: 'created_thought', glowEffect: true, radius: 50, text: 'An interesting title', color: color }]
        })

        store.get.grafika.focusOn({ id: 'created_thought' });

        store.set('splitUiLayout', 'half');
        if (!store.get.contextThoughtInMaking)
            store.set('contextThoughtInMaking', {
                _type: 'ThoughtInMaking',
                title: 'An interesting title',
                concepts: [],
                content: 'Here you can create thoughts.\n\n**Click on the preview** button to see what the final thought will end up looking like.\n\n' +
                    'To add a link, press the link button and click on a thought in the graph.',
                links: [],
                shape: 0,
                linkSelectionState: 'hidden',
                cursorPosition: 0,
                color: color
            });
    },

    hangleFocusChange: (store, _) => {
        store.get.grafika.focusOn({ id: 'created_thought' });
    },

    dispose: (store) => {
        store.get.grafika.removeData({
            nodes: [{ id: 'created_thought' }],
            edges: store.get.grafika.getData().edges.filter(e => e.targetId === 'created_thought')
        })
        store.get.grafika.interactionEvents.all.clear();
    }

} satisfies StateContract


const generateRandomColor = () => {
    let R = Math.floor((Math.random() * 127) + 127);
    let G = Math.floor((Math.random() * 127) + 127);
    let B = Math.floor((Math.random() * 127) + 127);

    let rgb = (R << 16) + (G << 8) + B;
    return `#${rgb.toString(16)}`;
}