import type { ProxyNode } from "grafika";
import { handleForwardExploration } from "../handleForwardExploration";
import type { ModeContract } from "./modeContract";
import { api_fetchConcept } from "../../api/fetchConcept";
import { convertThoughtsToNodes } from "../../utility/thoughtToNodeConvertor";
import { getEdgesFromNodes } from "../../utility/edgesFromThoughts";
import { updateGrafikaNodes } from "../../utility/updateGrafikaNodes";
import { getCurrentExpState } from "../getCurrentExpState";
import { ConceptViewer } from "../../components/ConceptViewer";
import conceptsIcon from '../../assets/icons/concepts.svg';

export const ConceptMode = {
    grafikaInitType: 'main',
    iconModeBar: conceptsIcon,
    iconMenu: conceptsIcon,
    contextBanner: {
        text: (store) => store.get.contextConcept?.tag ?? getCurrentExpState(store).focus ?? 'Concepts',
        color: (store) => store.get.contextConcept?.color ?? '#cccccc',
        onClick: (store) => store.get.grafika.focusOn('all'),
    },
    content: () => ConceptViewer,
    initialize: (store) => {
        store.get.grafika.interactionEvents.on('nodeClicked', (clickedNode: ProxyNode) => {
            const isFocused = !!getCurrentExpState(store).focus;
            handleForwardExploration(store, {
                mode: isFocused ? 'explore' : 'concept',
                focus: clickedNode.id
            });
        });

        store.get.grafika.interactionEvents.on('viewportMoved', () => {
            store.get.grafika.focusOn(null);
        });
    },
    hangleFocusChange: (store, tag) => {
        store.get.grafika.focusOn('all');

        if (store.get.splitUiLayout === 'hidden' || store.get.splitUiLayout === 'graph')
            store.set('splitUiLayout', 'half');

        store.set('contextDataLoading', true);

        if (!tag) throw new Error("concept mode requires tag");
        
        api_fetchConcept(tag)
            .then(concept => {
                store.set('contextConcept', concept);
                updateGrafikaNodes(
                    store.get.grafika,
                    convertThoughtsToNodes(concept.thoughts),
                    getEdgesFromNodes(concept.thoughts)
                );
            })
            .catch(e => console.error(e))
            .finally(() => store.set('contextDataLoading', false));
    },
    dispose: (store) => {
        store.get.grafika.interactionEvents.all.clear();
    },
} satisfies ModeContract;
