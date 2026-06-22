import { NodeShape, type ProxyNode } from "grafika";
import { handleForwardExploration } from "../handleForwardExploration";
import type { ModeContract } from "./modeContract";
import { EpochPseudoId } from "../../model/dto/epoch";
import { ThoughtCreator } from "../../components/thoughtCreator/ThoughtCreator";
import createIcon from '../../assets/icons/create_thought.svg';

export const CreateMode = {
    grafikaInitType: 'main',
    iconModeBar: createIcon,
    iconMenu: createIcon,
    entryPoint: { mode: 'epoch' as const, focus: String(EpochPseudoId.LATEST_CONTEXT) },
    contextBanner: {
        text: (store) => store.get.contextThoughtInMaking?.previewMode
            ? store.get.contextThoughtInMaking.title
            : "What's on your mind?",
        color: (store) => store.get.contextThoughtInMaking?.previewMode
            ? (store.get.user?.color ?? '#cccccc')
            : '#cccccc',
        onClick: (store) => store.get.grafika.focusOn({ id: 'created_thought' }),
        skipLoadingOverride: true,
    },

    content: (store) => store.get.contextThoughtInMaking ? ThoughtCreator : undefined,

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

        store.get.grafika.addData(
            {
                nodes: [{ id: 'created_thought', glowEffect: true, radius: 50,
                    text: store.get.contextThoughtInMaking?.title ?? '',
                    shape: store.get.contextThoughtInMaking?.shape ?? NodeShape.Circle,
                    color: color,
                    x: viewport.position.x, y: viewport.position.y
                }]
            },
            () => {
                const node = store.get.grafika.getData().nodes.find(n => n.id === 'created_thought');
                if (node) store.get.grafika.focusOn(node);
            }
        );

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