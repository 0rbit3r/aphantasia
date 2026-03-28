import { createSignal, onCleanup, useContext } from "solid-js";
import css from '../../styles/components/modeBar.module.css';
import { SymbolButton } from "../SymbolButton";
import fullscreenIcon from '../../assets/icons/fullscreen.svg';
import backIcon from '../../assets/icons/go_back.svg';
import forwardIcon from '../../assets/icons/go_forward.svg';
import appleIcon from '../../assets/icons/apple.svg'
import { navigateBack, navigateForward } from "../../stateManager/backAndForward";
import { AuthContext } from "../../contexts/authContext";
import { isItIosUnfortunionately as isAppleGodHelpUs } from "../../utility/getOperatingSystem";
import { StoreContext } from "../../contexts/storeContext";
import homeIcon from '../../assets/icons/home.svg';
import epochIcon from '../../assets/icons/galaxy.svg';
import exploreIcon from '../../assets/icons/bead.svg';
import createIcon from '../../assets/icons/create_thought.svg';
import conceptsIcon from '../../assets/icons/concepts.png';
import nothing from '../../assets/icons/nothing.svg';
import envelopeIcon from '../../assets/icons/envelope.svg';
import settingsIcon from '../../assets/icons/settings.svg';
import { getCurrentExpState } from "../../stateManager/getCurrentExpState";

export default function ModeBar() {
  const authContext = useContext(AuthContext);
  const store = useContext(StoreContext)!;

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

  const icons = {
    epochs: epochIcon,
    welcome: homeIcon,
    welcome_create: createIcon,
    explore: exploreIcon,
    create: createIcon,
    concepts: conceptsIcon,
    inbox: envelopeIcon,
    settings: settingsIcon
  };

  return <>
    <div class={css.mode_bar_container} style={{
      ['border-bottom']: '2px solid ' + (authContext.getAuthorizedUser()?.color ?? 'white')
    }}>

      <SymbolButton action={() => { navigateBack(store) }} img={backIcon}
        dim={store.get.explorationIndex === 0} />
      <SymbolButton action={() => { navigateForward(store) }} img={forwardIcon}
        dim={store.get.explorationIndex === store.get.explorationHistory.length - 1} />
      <div class={css.big_middle_button}
        style={{
          ['border-bottom']: '2px solid ' + (authContext.getAuthorizedUser()?.color ?? 'white'),
          ['border-right']: '2px solid ' + (authContext.getAuthorizedUser()?.color ?? 'white'),
          ['border-left']: '2px solid ' + (authContext.getAuthorizedUser()?.color ?? 'white')
        }}>
        <SymbolButton
          action={() => { store.set('modeMenuOpen', !store.get.modeMenuOpen); store.set('splitUiLayout', 'graph'); }}
          img={store.get.modeMenuOpen
            ? nothing
            : icons[getCurrentExpState(store).mode]} />
      </div>
      <SymbolButton action={() => store.set('notificationMessages', prev => [...prev, {text:'This feature is not yet ready. Stay tuned!', color: 'yellow'}])} img={envelopeIcon}
        dim={getCurrentExpState(store).mode !== 'inbox'} />
      <SymbolButton action={handleFullScreenButton}
        img={
          isAppleGodHelpUs()
            ? appleIcon
            : fullscreenIcon}
        dim={!isFullscreen()}
      />

    </div>
  </>
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