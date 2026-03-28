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
                content: 'Welcome to the thought creator.\n\n**Click the preview** button to see what the final thought will end up looking like.\n\n' +
                    'From there you can either **click "Edit" to go back** to the editor **or Publish to create** the thought."\n\n' +
                    'Go ahead and try to **publish this thought**',
                links: [],
                shape: 0,
                linkSelectionState: 'hidden',
                cursorPosition: 0,
                color: color
            });
        else store.set('contextThoughtInMaking', 'color', color);
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
    let R = Math.floor((Math.random() * 185) + 70);
    let G = Math.floor((Math.random() * 185) + 70);
    let B = Math.floor((Math.random() * 185) + 70);

    let rgb = (R << 16) + (G << 8) + B;
    return `#${rgb.toString(16)}`;
}