import { Show, useContext } from "solid-js";
import { Dynamic } from "solid-js/web";
import ModeBar from "./ModeBar";
import css from '../../styles/components/blockyUI.module.css';
import SplitUI from "./SplitUI";
import { ScreenOrientation } from '../../contexts/screenOrientationContext';
import { ModeMenu } from "./ModeMenu";
import { StoreContext } from "../../contexts/storeContext";
import ContextBanner from "./ContextBanner";
import { getCurrentExpState } from "../../stateManager/getCurrentExpState";
import { MODE_CONTRACTS } from "../../stateManager/modes/modeContract";
import MessageOverlay from "./MessageOverlay";


export interface UIContainerProps {
    onGrafikaRef: (element: HTMLDivElement) => void;
}

// This component holds almost all of Aphantasia's experience
// - the graph view, content view, control bars, validation messages...
// all dynamically rendering based on the current exploration state
export function BlockyUI({ onGrafikaRef }: UIContainerProps) {
    const screenOrientation = useContext(ScreenOrientation);
    const store = useContext(StoreContext)!;

    const contextBanner = () => (<ContextBanner />);
    const modeBar = () => (<ModeBar></ModeBar>);

    const graphPart = <div class={css.graph_container} >
        <div ref={onGrafikaRef} class={css.grafika_container} />
        <ModeMenu />
        <MessageOverlay />
    </div>

    const contentPart = <div class={css.banner_and_content_container}>
        <Show when={!screenOrientation.isLandscape()}>
            <div class={css.portrait_context_banner}>{contextBanner()}</div>
        </Show>
        <div classList={{
            [css.content_container]: true,
            [css.content_container_land]: screenOrientation.isLandscape()
        }}>
            <Dynamic component={MODE_CONTRACTS[getCurrentExpState(store).mode].content(store)} />
        </div>
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

