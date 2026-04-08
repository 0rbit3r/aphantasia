import type { ProxyNode } from "grafika";
import { handleForwardExploration } from "../handleForwardExploration";
import type { ModeContract } from "./modeContract";
import { api_fetchNotifications } from "../../api/api_notifications";


// inbox mode will show the replies to user's thoughts 
// (In the future it might show more such as thoughts from followed users, concepts etc.)
export const InboxMode = {
    grafikaSettings: null!,

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

        if (store.get.splitUiLayout === 'graph')
            store.set('splitUiLayout', 'half');
    },

    hangleFocusChange: (store, _) => {
        api_fetchNotifications().then(response =>
            store.set('contextInbox', response))
    },

    dispose: (store) => {
        store.get.grafika.interactionEvents.all.clear();
    }

} satisfies ModeContract