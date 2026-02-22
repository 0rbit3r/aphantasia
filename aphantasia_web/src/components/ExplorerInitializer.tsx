import { Explorer } from "./Explorer"
import { createSignal, onCleanup, useContext } from "solid-js";
import { AuthContext } from "../contexts/authContext";
import { AphantasiaStoreContext } from "../contexts/aphantasiaStoreContext";
import { parsePathToExplorationState } from "../model/explorationMode";
import { initWelcomeState, initWelcomeGrafikaSettings as initWelcomeGrafika } from "../stateManager/stateInitializers/init_Welcome";
import type { GrafikaInstance } from "grafika";
import type { AphantasiaStoreGetAndSet } from "../stateManager/aphantasiaStore";
import { LogoAndQuip } from "./LogoAndQuip";
import { getCurrentExpState } from "../stateManager/getCurrentExpState";


export const ExplorerInitializer = () => {
    const auth = useContext(AuthContext)!;
    const store = useContext(AphantasiaStoreContext)!;
    const [grafikaInst, setGrafikaInst] = createSignal<GrafikaInstance>()

    const initialExpState = parsePathToExplorationState(location.pathname, auth.getAuthorizedUser() !== null);
    store.set("explorationHistory", [initialExpState]);
    console.log("initialExpState");
    console.log(initialExpState);

    onCleanup(() => grafikaInst()?.dispose());

    return <>
        <LogoAndQuip hide={
            initialExpState?.mode !== 'welcome' || getCurrentExpState(store)?.focus === 'hello_explorer'}>
        </LogoAndQuip >
        <Explorer
            handleGrafikaInitialized={g => { setGrafikaInst(g); StateInitializers(g, store) }}
            grafikaSettings={initialGrafikaSettings[initialExpState.mode]}
        ></Explorer>
    </>
}

const initialGrafikaSettings = {
    welcome: initWelcomeGrafika,
    epochs: {},
    explore: {},
    concepts: {}
};

const StateInitializers = (g: GrafikaInstance, s: AphantasiaStoreGetAndSet) => (
    {
        welcome: initWelcomeState(g, s),
        epochs: {},
        explore: {},
        concepts: {}
    });

