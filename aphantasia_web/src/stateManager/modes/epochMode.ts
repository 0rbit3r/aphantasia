import { type ProxyNode } from "grafika";
import type { ModeContract } from "./modeContract";
import { handleForwardExploration } from "../handleForwardExploration";
import { api_fetchEpoch } from "../../api/fetchEpoch";
import { getEdgesFromNodes } from "../../utility/edgesFromThoughts";
import { convertThoughtsToNodes } from "../../utility/thoughtToNodeConvertor";
import { updateGrafikaNodes } from "../../utility/updateGrafikaNodes";
import { getCurrentExpState } from "../getCurrentExpState";
import { EpochPseudoId } from "../../model/dto/epoch";
import { EpochViewer } from "../../components/EpochViewer";
import epochIcon from '../../assets/icons/galaxy.svg';

let generation = 0;

export const EpochMode = {
    grafikaInitType: 'main',
    iconModeBar: epochIcon,
    iconMenu: epochIcon,
    contextBanner: {
        text: (store) => {
            const currentFocus = getCurrentExpState(store).focus;
            if (currentFocus === String(EpochPseudoId.LATEST_CONTEXT)) return import.meta.env.VITE_APP_TITLE;
            if (currentFocus === String(EpochPseudoId.EPOCHLESS)) return 'Epoch to be';
            return store.get.contextEpoch?.name ?? 'Epoch #' + store.get.contextEpoch?.id;
        },
        color: (_store) => '#eeeeee',
        onClick: (store) => store.get.grafika.focusOn('all'),
    },

    content: (store) => store.get.contextEpoch ? EpochViewer : undefined,

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

        if (store.get.splitUiLayout === 'hidden' || store.get.splitUiLayout === 'graph')
            store.set('splitUiLayout', 'half');
    },

    hangleFocusChange: (store, focusId) => {
        store.get.grafika.focusOn('all');

        const myGen = ++generation
        store.set('contextDataLoading', true);
        api_fetchEpoch(focusId)
            .then(epoch => {
                if (myGen !== generation) return;
                if (focusId === '-2') // only current context is date descending, the rest is date ascending
                    epoch.thoughts.sort((a, b) => (a.id < b.id) ? 1 : -1)
                else
                    epoch.thoughts.sort((a, b) => (a.id < b.id) ? -1 : 1)

                store.set('contextEpoch', epoch);

                // store.get.grafika.removeData();
                // store.get.grafika.addData(json)
                updateGrafikaNodes(store.get.grafika, convertThoughtsToNodes(epoch.thoughts), getEdgesFromNodes(epoch.thoughts));
            })
            .catch(e => console.error(e))
            .finally(() => store.set('contextDataLoading', false));
    },

    dispose: (store) => {
        store.get.grafika.interactionEvents.all.clear();
        store.set('contextEpoch', undefined);
    }

} satisfies ModeContract
