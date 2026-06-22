import type { GraphNode, ProxyNode } from "grafika";
import { handleForwardExploration } from "../handleForwardExploration";
import type { ModeContract } from "./modeContract";
import { api_fetchConcept } from "../../api/fetchConcept";
import { api_fetchConcepts } from "../../api/fetchConcepts";
import { convertThoughtsToNodes } from "../../utility/thoughtToNodeConvertor";
import { getEdgesFromNodes } from "../../utility/edgesFromThoughts";
import { updateGrafikaNodes } from "../../utility/updateGrafikaNodes";
import { getCurrentExpState } from "../getCurrentExpState";
import type { ConceptGraphNode } from "../../model/dto/concept";
import conceptsIcon from '../../assets/icons/concepts.svg';

const INITIAL_POS_RADIUS = 5000;

function deriveConceptEdges(nodes: ConceptGraphNode[]) {
    const tagSet = new Set(nodes.map(n => n.tag));
    return nodes.flatMap(node => {
        const lastIdx = node.tag.lastIndexOf('_');
        if (lastIdx <= 0) return [];
        const parent = node.tag.slice(0, lastIdx);
        return tagSet.has(parent) ? [{ sourceId: parent, targetId: node.tag, length: 500 }] : [];
    });
}

function convertConceptNodesToGrafika(nodes: ConceptGraphNode[]): GraphNode[] {
    const step = nodes.length > 0 ? Math.PI * 2 / nodes.length : 0;
    return nodes.map((node, i) => ({
        id: node.tag,
        x: Math.cos(i * step) * INITIAL_POS_RADIUS,
        y: Math.sin(i * step) * INITIAL_POS_RADIUS,
        color: node.color,
        text: node.tag,
        radius: Math.log((node.thoughtCount + 100) / 100) * 3000 + 50
    }));
}

export const ConceptTreesMode = {
    grafikaInitType: 'conceptTrees',
    iconModeBar: conceptsIcon,
    iconMenu: conceptsIcon,
    contextBanner: {
        text: (store) => store.get.contextConcept?.tag ?? getCurrentExpState(store).focus ?? 'Concepts',
        color: (store) => store.get.contextConcept?.color ?? '#cccccc',
        onClick: (store) => store.get.grafika.focusOn('all'),
    },
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

        if (!tag) {
            store.set('contextConcept', undefined);
            api_fetchConcepts()
                .then(graph => {
                    store.set('contextConceptList', graph.nodes.sort((a, b) => b.thoughtCount - a.thoughtCount));
                    updateGrafikaNodes(
                        store.get.grafika,
                        convertConceptNodesToGrafika(graph.nodes),
                        deriveConceptEdges(graph.nodes)
                    );
                })
                .catch(e => console.error(e))
                .finally(() => store.set('contextDataLoading', false));
            return;
        }

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
