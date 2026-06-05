import type { ProxyNode } from "grafika";
import { handleForwardExploration } from "../handleForwardExploration";
import type { ModeContract } from "./modeContract";
import { api_fetchConcept } from "../../api/fetchConcept";
import { convertThoughtsToNodes } from "../../utility/thoughtToNodeConvertor";
import { getEdgesFromNodes } from "../../utility/edgesFromThoughts";
import { updateGrafikaNodes } from "../../utility/updateGrafikaNodes";

export const ConceptMode = {
    grafikaInitType: 'main',
    initialize: (store) => {
        store.get.grafika.interactionEvents.on('nodeClicked', (clickedNode: ProxyNode) => {
            handleForwardExploration(store, {
                mode: 'explore',
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

        if (!tag) {
            console.error('No concept tag provided to ConceptMode');
            return;
        }

        store.set('contextDataLoading', true);
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
