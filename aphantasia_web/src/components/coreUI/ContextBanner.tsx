import { createEffect, createSignal, useContext } from 'solid-js';
import css from '../../styles/components/contextBanner.module.css';
import { StoreContext } from '../../contexts/storeContext';
import { getCurrentExpState } from '../../stateManager/getCurrentExpState';
import { ScreenOrientation } from '../../contexts/screenOrientationContext';

const defaultTextColor = '#cccccc';

// This banner will be almost always visible and display the current mode, focused thought title, profile name
// or any other "current state"
// eg. Settings, Big graph, _birds, A thought about dogs, UserMcFakename, 
export default function ContextBanner() {
  const store = useContext(StoreContext)!;
  const screenOrientation = useContext(ScreenOrientation)

  const [text, setText] = createSignal('Aphantasia');
  const [color, setColor] = createSignal(defaultTextColor);

  createEffect(() => {
    const currentMode = getCurrentExpState(store).mode;
    if (currentMode === 'welcome_create' || currentMode === 'create') { // TODO - make individual modes define these for themselves and only reference it here instead of ugly ifs...
      if (store.get.contextThoughtInMaking?.previewMode) {
        setText(store.get.contextThoughtInMaking.title);
        setColor(store.get.user?.color ?? defaultTextColor)
      }
      else {
        setText('What\'s on your mind?')
        setColor(defaultTextColor);
      }
      return;
    }
    if (store.get.contextDataLoading) {
      setText('Loading...');
      setColor('#999999');
      return;
    }
    if (currentMode === 'welcome' || currentMode === 'explore'
    ) {
      setText(store.get.contextThought?.title ?? '');
      setColor(store.get.contextThought?.color ?? defaultTextColor);
    }
    if (currentMode === 'epochs' && !getCurrentExpState(store).focus) {
      setText(import.meta.env.VITE_APP_TITLE);
      setColor('#eeeeee');
    }
    if (currentMode === 'settings') {
      setText('Settings');
      setColor(defaultTextColor)
    }
    if (currentMode === 'inbox') {
      setText('Inbox');
      setColor(store.get.user?.color ?? defaultTextColor);
    }
    if (currentMode === 'chat') {
      setText('Chat');
      setColor(defaultTextColor);
    }
  })

  return <div classList={{
    [css.context_banner_container]: true,
    [css.context_banner_container_align_left]: store.get.splitUiLayout === 'half' && screenOrientation.isLandscape()
  }} style={{
    border: `2px solid ${color()}`
  }}
    onClick={() => {
      const currentState = getCurrentExpState(store);
      if (currentState.mode === 'explore' || currentState.mode === 'welcome')
        store.get.grafika.focusOn({ id: store.get.contextThought?.id ?? '' });
      if (currentState.mode === 'epochs' && !currentState.focus)
        store.get.grafika.focusOn('all');
      if (currentState.mode === 'welcome_create' || currentState.mode === 'create')
        store.get.grafika.focusOn({ id: 'created_thought' })
    }}>
    <h1 style={{ color: color() }}>
      {text()}
    </h1>
  </div>
}