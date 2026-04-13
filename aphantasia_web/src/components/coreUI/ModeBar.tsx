import { createSignal, onCleanup, onMount, Show, useContext } from "solid-js";
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
import arrowIcon from '../../assets/icons/arrow.svg';
import settingsIcon from '../../assets/icons/settings.svg';
import { getCurrentExpState } from "../../stateManager/getCurrentExpState";
import { handleForwardExploration } from "../../stateManager/handleForwardExploration";
import { api_fetchNotifications } from "../../api/api_notifications";

export default function ModeBar() {
  const authContext = useContext(AuthContext);
  const store = useContext(StoreContext)!;

  const [notificationsInterval, setNotificationsInterval] = createSignal<number | undefined>();
  onMount(() => {
    const fetchNotifications = () => api_fetchNotifications()
      .then(result => store.set('contextInbox', result));

    fetchNotifications();
    setNotificationsInterval(setInterval(fetchNotifications, 180 * 1000));
  });
  onCleanup(() => {
    if (notificationsInterval() !== undefined)
      clearInterval(notificationsInterval());
  })

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
    inbox: arrowIcon,
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
      <div class={css.inbox_button_container}>
        <SymbolButton action={() => authContext.getAuthorizedUser()
          ? handleForwardExploration(store, { mode: 'inbox' })
          : store.set('screenMessages', prev => [...prev, {color: 'yellow', text:'Log in to access inbox'}])} img={envelopeIcon}
          dim={getCurrentExpState(store).mode !== 'inbox'} />
        <Show when={getCurrentExpState(store).mode != 'inbox' && store.get.contextInbox?.some(n => !n.read)}>
          <div class={css.notifications_indicator}
            style={{ color: store.get.user?.color ?? '#ffffff' }}>•</div>
        </Show>
      </div>
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