import { HolisticUI } from "./HolisticUI";
import { addGrafika, type GrafikaInstance, type GrafikaSettings } from "grafika";
import { AphantasiaStoreContext } from "../contexts/aphantasiaStoreContext";
import { useContext } from "solid-js";

export interface ExplorerProps {
    grafikaSettings: GrafikaSettings;
    handleGrafikaInitialized: (g: GrafikaInstance) => void;
}

export const Explorer = (props: ExplorerProps) => {
    const store = useContext(AphantasiaStoreContext)!;

    const handleGrafikaRef = (element: HTMLDivElement) => {
        if (!element) return; 
        store.set('grafika', addGrafika(element, props.grafikaSettings));
        props.handleGrafikaInitialized(store.get.grafika);
    };

    return <HolisticUI store={store} onGrafikaRef={handleGrafikaRef}></HolisticUI>;
}

