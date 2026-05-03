import { GraphExplorer } from "./coreUI/GraphExplorer"
import { createEffect, createSignal, onCleanup, Show, useContext } from "solid-js";
import { AuthContext } from "../contexts/authContext";
import { StoreContext } from "../contexts/storeContext";
import { parsePathToExplorationState, type ExplorationStateDescriptor } from "../stateManager/explorationMode";
import type { GrafikaInstance } from "grafika";
import { LogoAndQuip } from "./LogoAndQuip";
import { getCurrentExpState } from "../stateManager/getCurrentExpState";
import { MODE_CONTRACTS } from "../stateManager/modes/modeContract";
import { Loading } from "./Loading";
import { GRAFIKA_INITIALIZERS } from "../stateManager/modes/grafikaInitializers/grafikaInitTypes";

let firstLoad = true;

export const AphantasiaContainer = () => {
    const auth = useContext(AuthContext)!;
    const store = useContext(StoreContext)!;
    const [grafikaInst, setGrafikaInst] = createSignal<GrafikaInstance>();
    const [initialExpState, setInitialExpState] = createSignal<ExplorationStateDescriptor>(undefined!);


    // setInitialState when the authorizedUser call loads
    createEffect(() => {
        if (!auth.authStatusLoaded() || !firstLoad) return;  
        // only do this the very first time auth is loaded (when saving settings terminate)
        firstLoad = false;

        const loggedIn = auth.getAuthorizedUser() !== null;
        location.pathname;//...

        const initialPath = loggedIn ? '/epochs' : '/welcome';
        const state = parsePathToExplorationState(initialPath);
        console.log(initialPath)
        store.set("explorationHistory", [state]);
        setInitialExpState(state);
    });


    onCleanup(() => grafikaInst()?.dispose());

    return <>
        <Show when={initialExpState() != undefined}>
            <LogoAndQuip hide={
                initialExpState()?.mode !== 'welcome' || getCurrentExpState(store)?.focus === 'hello_explorer'}>
            </LogoAndQuip >
            <GraphExplorer
                handleGrafikaInitialized={g => {
                    setGrafikaInst(g);
                    g.simStart();
                    if (initialExpState()?.mode === 'welcome') {
                        g.focusOn({ id: "hello_explorer" });
                        store.set('splitUiLayout', 'hidden');
                    }
                    //Initialize the initial store
                    MODE_CONTRACTS[initialExpState()!.mode].initialize(store);
                    MODE_CONTRACTS[initialExpState()!.mode].hangleFocusChange(store, initialExpState()!.focus)
                }}
                grafikaSettings={GRAFIKA_INITIALIZERS[MODE_CONTRACTS[initialExpState().mode].grafikaInitType]}
            ></GraphExplorer>
        </Show>
        <Show when={!auth.authStatusLoaded()}>
            <Loading></Loading>
        </Show>
    </>
}
