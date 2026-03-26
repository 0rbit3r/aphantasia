import { Match, Show, Switch, useContext } from "solid-js";
import { ThoughtViewer } from "../thoughtViewer/ThoughtViewer";
import ModeBar from "./ModeBar";
import css from '../../styles/components/blockyUI.module.css';
import SplitUI from "./SplitUI";
import { ScreenOrientation } from '../../contexts/screenOrientationContext';
import { ModeMenu } from "./ModeMenu";
import { StoreContext } from "../../contexts/storeContext";
import ContextBanner from "./ContextBanner";
import { getCurrentExpState } from "../../stateManager/getCurrentExpState";
import { ThoughtCreator } from "../thoughtCreator/ThoughtCreator";
import { LoginForm } from "../LoginForm";
import { EpochViewer } from "../EpochViewer";


export interface BlockyUIProps {
    onGrafikaRef: (element: HTMLDivElement) => void;
}

// This component holds almost all of Aphantasia's experience
// - the graph view, content view, control bars, validation messages...
// all dynamically rendering based on the current exploration state
export function BlockyUI({ onGrafikaRef }: BlockyUIProps) {
    const screenOrientation = useContext(ScreenOrientation);
    const store = useContext(StoreContext)!;

    const contextBanner = () => (<ContextBanner />);
    const modeBar = () => (<ModeBar></ModeBar>);

    const graphPart = <div class={css.graph_container} >
        <div ref={onGrafikaRef} class={css.grafika_container} />
        <ModeMenu />
    </div>

    const contentPart = <div class={css.content_container}>
        <Show when={!screenOrientation.isLandscape()}>
            <div class={css.portrait_context_banner}>{contextBanner()}</div>
        </Show>
        <Switch>
            <Match when={getCurrentExpState(store).focus === 'log_in'}>
                <LoginForm />
            </Match>
            <Match when={store.get.contextThought
                && (getCurrentExpState(store).mode === 'welcome' || getCurrentExpState(store).mode === 'explore')}>
                <ThoughtViewer />
            </Match>
            <Match when={store.get.contextThoughtInMaking
                && (getCurrentExpState(store).mode === 'welcome_create' || getCurrentExpState(store).mode === 'create')}>
                <ThoughtCreator />
            </Match>
            <Match when={store.get.contextEpoch
                && (getCurrentExpState(store).mode === 'epochs')}>
                <EpochViewer />
            </Match>
        </Switch>

    </div>

    return (
        <div class={css.application_container}>
            <div class={`${css.top_bar} ${store.get.splitUiLayout === 'hidden' ? css.top_bar_hidden : ''}`}>
                <Show when={screenOrientation.isLandscape()}>
                    <div class={css.top_bar_flex_child_first}>{contextBanner()}</div>
                </Show>
                <div class={css.top_bar_flex_child_second}>{modeBar()}</div>
            </div>
            <SplitUI
                second={screenOrientation.isLandscape() ? graphPart : contentPart}
                first={screenOrientation.isLandscape() ? contentPart : graphPart} />
        </div>
    )
}

