import { createSignal, onCleanup, Show, useContext } from "solid-js";

import css from '../styles/components/modeBar.module.css';
import { SymbolButton } from "./SymbolButton";
import fullscreenIcon from '../assets/icons/fullscreen.png';
import backIcon from '../assets/icons/go_back.png';
import forwardIcon from '../assets/icons/go_forward.png';
import bigGraphIcon from '../assets/icons/big_graph.png';
import notificationsIcon from '../assets/icons/bell.png';
import type { AphantasiaStoreGetAndSet } from "../stateManager/aphantasiaStore";
import { navigateBack, navigateForward } from "../stateManager/backAndForward";
import { AuthContext } from "../contexts/authContext";


interface ModeBarProps {
  fullscreenButtonEnabled?: boolean;
  store: AphantasiaStoreGetAndSet;
}

export default function ModeBar(props: ModeBarProps) {
  const authContext = useContext(AuthContext);

  //fullscreen
  const [isFullscreen, setFullScreen] = createSignal(false);
  const handleFullScreenButton = () => {
    if (isFullscreen()) {
      closeFullscreen();
      setFullScreen(false);
    } else {
      openFullscreen();
      setFullScreen(true);
    }
  };
  onCleanup(() => {
    if (isFullscreen()) closeFullscreen();
  });

  return <div     style={{
        ['border-bottom']: '2px solid '+ (authContext.getAuthorizedUser()?.color ?? 'white')
      }}
  class={css.mode_bar_container}>
    <SymbolButton action={() => { navigateBack(props.store) }} img={<img src={backIcon} />} />
    <SymbolButton action={() => { navigateForward(props.store) }} img={<img src={forwardIcon} />} />
    <div class={css.big_middle_button}
    style={{
        ['border-bottom']: '2px solid '+ (authContext.getAuthorizedUser()?.color ?? 'white'),
        ['border-right']: '2px solid '+ (authContext.getAuthorizedUser()?.color ?? 'white'), 
        ['border-left']: '2px solid '+ (authContext.getAuthorizedUser()?.color ?? 'white')
      }}>
      <SymbolButton action={() => { }} img={<img src={bigGraphIcon}></img>} />
    </div>
    <SymbolButton action={() => { }} img={<img src={notificationsIcon}></img>} />
    <Show when={props.fullscreenButtonEnabled || (props.fullscreenButtonEnabled === undefined)}>
      <SymbolButton action={handleFullScreenButton}
        img={<img src={fullscreenIcon}></img>} />
    </Show>
  </div>
}

function openFullscreen() {
  if (document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen();
    setTimeout(() => window.dispatchEvent(new Event("resize")), 500);
  }
}

function closeFullscreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  }
}