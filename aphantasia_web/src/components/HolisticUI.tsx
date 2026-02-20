import { Show, useContext } from "solid-js";
import { ThoughtViewer } from "./contentViewers/ThoughtViewer";
import ModeBar from "./ModeBar";
import css from '../styles/components/holisticUI.module.css';
import SplitUI from "./SplitUI";
import ContextBanner from "./ContextBanner";
import type { AphantasiaStoreGetAndSet } from "../stateManager/aphantasiaStore";
import { ScreenOrientation } from '../contexts/screenOrientationContext';
import { ModeMenu } from "./ModeMenu";


export interface HolisticUIProps {
    store: AphantasiaStoreGetAndSet;
    onGrafikaRef: (element: HTMLDivElement) => void;
}

// This component holds almost all of Aphantasia's experience
// - the graph view, content view, control bars, validation messages etc.
// The idea is to put this inside a component that will handle things like fetching data
export function HolisticUI({ store, onGrafikaRef }: HolisticUIProps) {
    const screenOrientation = useContext(ScreenOrientation);

    const contextBanner = () => (<ContextBanner />);
    const modeBar = () => (<ModeBar></ModeBar>);

    const graphPart = <div class={css.graph_container} >
        <div ref={onGrafikaRef} class={css.grafika_container} />
        {store.get.modeMenuOpen && <ModeMenu />}
    </div>;

    const contentPart = <div class={css.content_container}>
        <Show when={!screenOrientation.isLandscape()}>
            <div class={css.portrait_context_banner}>{contextBanner()}</div>
        </Show>
        <ThoughtViewer />
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

