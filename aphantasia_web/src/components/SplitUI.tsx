import { createSignal, createEffect, type JSX, Show, useContext, onMount } from "solid-js";
import css from '../styles/components/splitUI.module.css';
import { ScreenOrientation } from '../contexts/screenOrientationContext';
import { AphantasiaStoreContext } from "../contexts/aphantasiaStoreContext";
import { getCurrentExpState } from "../stateManager/getCurrentExpState";

export type SplitLayout = "graph" | "content" | "half";

interface SplitViewProps {
  first: JSX.Element;
  second: JSX.Element;
}

export default function SplitUI(props: SplitViewProps) {
  const screenOrientation = useContext(ScreenOrientation);
  const store = useContext(AphantasiaStoreContext)!;

  const [handleHeld, setHandleHeld] = createSignal(false);
  const [internalRatio, setInternalRatio] = createSignal<string>(null!);

  createEffect(() => {
    if (!handleHeld())
      setInternalRatio(convertForcedLayoutToRatio(store?.get.splitUiLayout ?? "graph", screenOrientation.isLandscape()))
  });

  const handleHandleGrab = (e: PointerEvent & { currentTarget: HTMLDivElement; target: Element; }) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setHandleHeld(true);
    handleHandleDrag(e);
  }

  const handleHandleRelease = (e: PointerEvent & { currentTarget: HTMLDivElement; target: Element; }) => {
    e.currentTarget?.releasePointerCapture(e.pointerId);
    const prev = internalRatio();
    setHandleHeld(false);
    if ((!screenOrientation.isLandscape() && Number.parseFloat(prev.slice(0, -1)) / 100 > releaseThresholdsPortrait.bottom)
      || screenOrientation.isLandscape() && Number.parseFloat(prev.slice(0, -1)) / 100 > releaseThresholdsLandscape.right)
      store?.set('splitUiLayout', screenOrientation.isLandscape() ? 'content' : 'graph');
    else if ((!screenOrientation.isLandscape() && Number.parseFloat(prev.slice(0, -1)) / 100 > releaseThresholdsPortrait.top)
      || screenOrientation.isLandscape() && Number.parseFloat(prev.slice(0, -1)) / 100 > releaseThresholdsLandscape.left)
      store?.set('splitUiLayout', 'half');
    else
      store?.set('splitUiLayout', screenOrientation.isLandscape() ? 'graph' : 'content');
  }

  const handleHandleDrag = (e: PointerEvent & { currentTarget: HTMLDivElement; target: Element; }) => {
    if (!handleHeld()) return;
    const parent = e.currentTarget.parentElement;
    if (!parent) return;

    if (screenOrientation.isLandscape()) {
      const rect = parent.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      const ratio = relativeX / rect.width;
      setInternalRatio((ratio * 100) + "%");
      return;
    }
    const rect = parent.getBoundingClientRect();
    const relativeY = e.clientY - rect.top;
    const ratio = relativeY / rect.height;
    setInternalRatio((ratio * 100) + "%");
  }

  return <div classList={{
    [css.split_ui_container]: true,
    [css.split_ui_container_land]: screenOrientation.isLandscape()
  }}>
    <div classList={{
      [css.first_subelement]: true,
      [css.first_subelement_land]: screenOrientation.isLandscape()
    }}
      style={screenOrientation.isLandscape()
        ? {
          height: '100%',
          transition: handleHeld() ? "none" : "width 0.65s ease",
          width: handleHeld()
            ? `calc(${internalRatio()} - 10px)`
            : internalRatio(),
        }
        : {
          height: handleHeld()
            ? `calc(${internalRatio()} + 10px)`
            : internalRatio(),
          transition: handleHeld() ? "none" : "height 0.65s ease"
        }}>
      {props.first}</div>
    <div classList={{
      [css.handle_port]: !screenOrientation.isLandscape(),
      [css.handle_land]: screenOrientation.isLandscape(),
      [css.handle_left]: !screenOrientation.isLandscape()
    }}
      onPointerDown={handleHandleGrab}
      onPointerMove={handleHandleDrag}
      onPointerUp={handleHandleRelease}
    ></div>
    <Show when={!screenOrientation.isLandscape()}>
      <div classList={{
        [css.handle_port]: !screenOrientation.isLandscape(),
        [css.handle_land]: screenOrientation.isLandscape(),
        [css.handle_right]: true
      }}
        onPointerDown={handleHandleGrab}
        onPointerMove={handleHandleDrag}
        onPointerUp={handleHandleRelease}
      ></div>
    </Show>


    <div classList={{
      [css.second_subelement]: true,
      [css.second_subelement_land]: screenOrientation.isLandscape()
    }}>{props.second}</div>
  </div>
}


const convertForcedLayoutToRatio = (layout: "graph" | "content" | "half", isLandscape: boolean) => {
  if (isLandscape) {
    return layout === "graph"
      ? landscape_ratios.graph
      : layout === "content"
        ? landscape_ratios.extended
        : landscape_ratios.middle
  }
  return layout === "graph"
    ? portrait_ratios.graph
    : layout === "content"
      ? portrait_ratios.content
      : portrait_ratios.middle
}

const portrait_ratios = {
  content: "calc(var(--handlebar-thickness) * 2)",
  middle: "50%",
  graph: "calc(100% - var(--context-banner-height))"
}

const releaseThresholdsPortrait = {
  top: 0.35,
  bottom: 0.65
}

const releaseThresholdsLandscape = {
  left: 0.15,
  right: 0.6
}

const landscape_ratios = {
  graph: "0",
  middle: "33%",
  extended: "66%",
}