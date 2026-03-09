import { Show, useContext } from "solid-js";
import { ThoughtViewer } from "./thoughtViewer/ThoughtViewer";
import ModeBar from "./ModeBar";
import css from '../styles/components/holisticUI.module.css';
import SplitUI from "./SplitUI";
import { ScreenOrientation } from '../contexts/screenOrientationContext';
import { ModeMenu } from "./ModeMenu";
import { AphantasiaStoreContext } from "../contexts/aphantasiaStoreContext";
import { isThought, isThoughtInMaking } from "../utility/isTypeOf";
import ContextBanner from "./thoughtViewer/ContextBanner";
import { getCurrentExpState } from "../stateManager/getCurrentExpState";
import { ThoughtCreator } from "./thoughtCreator/ThoughtCreator";


export interface HolisticUIProps {
    onGrafikaRef: (element: HTMLDivElement) => void;
}

// This component holds almost all of Aphantasia's experience
// - the graph view, content view, control bars, validation messages etc.
// The idea is to put this inside a component that will handle things like fetching data
export function HolisticUI({ onGrafikaRef }: HolisticUIProps) {
    const screenOrientation = useContext(ScreenOrientation);
    const store = useContext(AphantasiaStoreContext)!;

    const contextBanner = () => (<ContextBanner />);
    const modeBar = () => (<ModeBar></ModeBar>);

    const graphPart = <div class={css.graph_container} >
        <div ref={onGrafikaRef} class={css.grafika_container} />
        <ModeMenu />
    </div>;

    const contentPart = <div class={css.content_container}>
        <Show when={!screenOrientation.isLandscape()}>
            <div class={css.portrait_context_banner}>{contextBanner()}</div>
        </Show>

        <Show when={isThought(store.get.contextData)
            && (getCurrentExpState(store).mode === 'welcome' || getCurrentExpState(store).mode === 'explore')}>
            <ThoughtViewer />
        </Show>

        <Show when={isThoughtInMaking(store.get.contextData)
            && (getCurrentExpState(store).mode === 'welcome_create' || getCurrentExpState(store).mode === 'create')}>
            <ThoughtCreator />
        </Show>

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

