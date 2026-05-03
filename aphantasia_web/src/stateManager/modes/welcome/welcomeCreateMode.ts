import type { ModeContract } from "../modeContract";
import { NodeShape, type ProxyNode } from "grafika";
import { handleForwardExploration } from "../../handleForwardExploration";
import type { ThoughtInMaking } from "../../../model/ThoughtInMaking";
import { createSignal } from "solid-js";

export const [tutorialCreatedThoughtIndex, setTutorialCreatedThoughtIndex] = createSignal(0);

export const WelcomeCreateMode = {
    grafikaInitType: 'main',

    initialize: (store) => {
        store.get.grafika.interactionEvents.on('nodeClicked', (clickedNode: ProxyNode) => {
            handleForwardExploration(store, {
                mode: 'welcome',
                focus: clickedNode.id
            });
        });
        store.get.grafika.interactionEvents.on('viewportMoved', () => { store.get.grafika.focusOn(null) });

        const color = generateRandomColor();
        const index = Math.min(tutorialCreatedThoughtIndex(), tutorialCreatedThoughts.length - 1);
        const currentTutorialThought = tutorialCreatedThoughts[index];

        const viewport = store.get.grafika.getViewport();
        store.get.grafika.addData({
            nodes: [{
                id: 'created_thought', glowEffect: true, radius: 50, 
                text: currentTutorialThought.title ?? '',
                shape: currentTutorialThought.shape ?? NodeShape.Circle,
                color: color, x: viewport.position.x, y: viewport.position.y
            }]
        })

        store.get.grafika.focusOn({ id: 'created_thought' });

        store.set('splitUiLayout', 'half');
        if (!store.get.contextThoughtInMaking) {
            currentTutorialThought.color = color;
            store.set('contextThoughtInMaking', currentTutorialThought);
        }
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

} satisfies ModeContract


const generateRandomColor = () => {
    let R = Math.floor((Math.random() * 185) + 70);
    let G = Math.floor((Math.random() * 185) + 70);
    let B = Math.floor((Math.random() * 185) + 70);

    let rgb = (R << 16) + (G << 8) + B;
    return `#${rgb.toString(16)}`;
}

const tutorialCreatedThoughts = [
    {
        title: 'An interesting title',
        concepts: [],
        content: '**Welcome to the thought creator.**\n' +
            'Here is a very quick guide through its various features:\n\n' +
            '1) **stars for bold**\n' +
            '2) __underscores for italic__\n' +
            '3) Links look like this: [let_us_create_a_thought][Sup... \'name\'s Link. Thought Link]\n' +
            '   ...where the first pair of brackets contain the ID and second one the displayed text.\n\n' +
            'Now **click Preview and then Publish**.',
        links: [],
        shape: 0,
        linkSelectionState: 'hidden',
        cursorPosition: 0,
        color: '#ffffff',
        previewMode: false
    },
    {
        title: 'An association',
        concepts: [],
        content: 'To proceed, connect thoughts "Good job" and "Link me!" together.\n\n' +
            '1) Put your cursor here: >>>  <<<\n\n' +
            '2) Press the "Link" button.\n\n' +
            '3) Click on thought "Good job!" in the thought in graph view\n\n' +
            '4) Put your cursor here: >>>  <<< and link thought "Link me!" in the same way.\n\n' +
            '5) Publish the thought',
        links: [],
        shape: 0,
        linkSelectionState: 'hidden',
        cursorPosition: 0,
        color: '#ffffff',
        previewMode: false
    },
    {
        title: '',
        concepts: [],
        content: '',
        links: [],
        shape: 0,
        linkSelectionState: 'hidden',
        cursorPosition: 0,
        color: '#ffffff',
        previewMode: false

    }
] satisfies ThoughtInMaking[];