import type { ProxyNode } from "grafika";
import { handleForwardExploration } from "../handleForwardExploration";
import type { ModeContract } from "./modeContract";
import { api_fetchUserProfile } from "../../api/fetchUserProfile";
import { convertThoughtsToNodes } from "../../utility/thoughtToNodeConvertor";
import { getEdgesFromNodes } from "../../utility/edgesFromThoughts";

export const ProfileMode = {
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
    hangleFocusChange: (store, focusId) => {
        store.get.grafika.focusOn('all');

        if (store.get.splitUiLayout === 'hidden' || store.get.splitUiLayout === 'graph')
            store.set('splitUiLayout', 'half');

        if (!focusId) {
            console.error('No user id provided to ProfileMode')
            return;
        }

        store.get.grafika.removeData(); //todo - eventually don't remove/readd but leave intersection in place to make the transition look better
        store.set('contextDataLoading', true);
        api_fetchUserProfile(focusId)
            .then(profile => {
                store.set('contextProfile', profile);
                store.get.grafika.addData({
                    nodes: convertThoughtsToNodes(profile.thoughts),
                    edges: getEdgesFromNodes(profile.thoughts)
                });
            })
            .catch(e => console.error(e))
            .finally(() => store.set('contextDataLoading', false));
    },
    dispose: (store) => {
        store.get.grafika.interactionEvents.all.clear();
    },
} satisfies ModeContract;