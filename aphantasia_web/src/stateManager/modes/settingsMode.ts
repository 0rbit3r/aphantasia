import { type ProxyNode } from "grafika";
import type { ModeContract } from "./modeContract";
import { handleForwardExploration } from "../handleForwardExploration";
import { api_fetchUserProfile } from "../../api/fetchUserProfile";
import { getEdgesFromNodes } from "../../utility/edgesFromThoughts";
import { convertThoughtsToNodes } from "../../utility/thoughtToNodeConvertor";
import { updateGrafikaNodes } from "../../utility/updateGrafikaNodes";
import settingsIcon from '../../assets/icons/settings.svg';


export const SettingsMode = {
    grafikaInitType: 'main',
    iconModeBar: settingsIcon,
    iconMenu: settingsIcon,
    contextBanner: {
        text: (_store) => 'Settings',
        color: (_store) => '#cccccc',
        onClick: (store) => store.get.grafika.focusOn('all'),
    },

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
        if (store.get.splitUiLayout !== 'content') store.set('splitUiLayout', 'half');
    },

    hangleFocusChange: (store, _) => {
        if (!store.get.user) return;
        api_fetchUserProfile(store.get.user.id)
            .then(profile => {
                updateGrafikaNodes(store.get.grafika, convertThoughtsToNodes(profile.thoughts), getEdgesFromNodes(profile.thoughts),
                () =>{
                    store.get.grafika.focusOn('all');
                });
            })
            .catch(e => console.error(e))
            .finally(() => store.set('contextDataLoading', false));
    },

    dispose: (store) => {
        store.get.grafika.interactionEvents.all.clear();
    }

} satisfies ModeContract