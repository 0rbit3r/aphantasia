import { BlockyUI } from "./BlockyUI";
import { addGrafika, type GrafikaInstance, type GrafikaSettings } from "grafika";
import { StoreContext } from "../../contexts/storeContext";
import { useContext } from "solid-js";

export interface ExplorerProps {
    grafikaSettings: GrafikaSettings;
    handleGrafikaInitialized: (g: GrafikaInstance) => void;

    reloadGrafika?: (s: GrafikaSettings) => void;
}

export const GraphExplorer = (props: ExplorerProps) => {
    const store = useContext(StoreContext)!;

    const handleGrafikaRef = (element: HTMLDivElement) => {
        if (!element) return;
        store.set('grafikaElement', element);
        store.set('grafika', addGrafika(element, props.grafikaSettings));
        props.handleGrafikaInitialized(store.get.grafika);
    };

    return <BlockyUI onGrafikaRef={handleGrafikaRef}></BlockyUI>;
}

