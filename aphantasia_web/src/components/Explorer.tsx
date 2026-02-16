import { HolisticUI } from "./HolisticUI";
import { addGrafika, type GrafikaSettings, type ProxyNode } from "grafika";
import { AphantasiaStoreContext } from "../contexts/aphantasiaStoreContext";
import { useContext } from "solid-js";
import { handleForwardExploration } from "../stateManager/handleForwardExploration";
import { getCurrentExpState } from "../stateManager/getCurrentExpState";
import type { AphantasiaStoreGetAndSet } from "../stateManager/aphantasiaStore";
import type { ExplorationStateDescriptor } from "../model/explorationMode";

export interface ExplorerProps {
    grafikaSettings: GrafikaSettings;

    loadData: (store: AphantasiaStoreGetAndSet, state: ExplorationStateDescriptor) => void;


    // here is where to resume - load data will just implement

}

export const Explorer = (props: ExplorerProps) => {
    const store = useContext(AphantasiaStoreContext)!;

    const handleGrafikaRef = (element: HTMLDivElement) => {
        if (!element) return;
        store.set('grafika', addGrafika(element, props.grafikaSettings));
        // store.get.grafika.simStart();
        store.get.grafika.focusOn('all');
        store.get.grafika.interactionEvents.on('nodeClicked', (node: ProxyNode) => {
            handleForwardExploration({ get: store.get, set: store.set }, {
                mode: getCurrentExpState(store).mode,
                focus: node.id
            });
        });
        store.get.grafika.interactionEvents.on('viewportMoved', () => {
            store.get.grafika.focusOn(null);
        });
    };

    return <HolisticUI store={store} onGrafikaRef={handleGrafikaRef}></HolisticUI>;
}

