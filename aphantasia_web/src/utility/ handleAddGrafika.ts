import { addGrafika, type GrafikaInstance, type GrafikaSettings } from "grafika";
import type { AphantasiaStoreGetAndSet } from "../stateManager/aphantasiaStore";

export const handleGrafikaReinitialization = async (
    store: AphantasiaStoreGetAndSet,
    settings: GrafikaSettings,
    onAdded: (grafika: GrafikaInstance) => void
) => {
    if (store.get.grafika) {
        store.get.grafika.dispose();
    }
    const grafika = await addGrafika(store.get.grafikaElement, settings);
    grafika.start();
    store.set('grafika', grafika);
    onAdded(grafika);
}
