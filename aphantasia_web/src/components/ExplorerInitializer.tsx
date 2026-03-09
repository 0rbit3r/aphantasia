import { Explorer } from "./Explorer"
import { createSignal, onCleanup, useContext } from "solid-js";
import { AuthContext } from "../contexts/authContext";
import { AphantasiaStoreContext } from "../contexts/aphantasiaStoreContext";
import { parsePathToExplorationState } from "../model/explorationMode";
import type { GrafikaInstance } from "grafika";
import { LogoAndQuip } from "./LogoAndQuip";
import { getCurrentExpState } from "../stateManager/getCurrentExpState";
import { STATE_CONTRACTS } from "../stateManager/states/stateContract";


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
            handleGrafikaInitialized={g => { setGrafikaInst(g); STATE_CONTRACTS[initialExpState.mode].initialize(store)}}
            grafikaSettings={STATE_CONTRACTS[initialExpState.mode].grafikaSettings}
        ></Explorer>
    </>
}
