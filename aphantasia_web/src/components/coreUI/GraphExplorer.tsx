import { UIContainer } from "./UIContainer";
import { type GrafikaInstance, type GrafikaSettings } from "grafika";
import { StoreContext } from "../../contexts/storeContext";
import { useContext } from "solid-js";
import { handleGrafikaReinitialization } from "../../utility/ handleAddGrafika";

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
        handleGrafikaReinitialization(store, props.grafikaSettings, grafika => {
            props.handleGrafikaInitialized(grafika);
        });
    };

    return <UIContainer onGrafikaRef={handleGrafikaRef}></UIContainer>;
}