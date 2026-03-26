import { createEffect, createSignal, useContext } from 'solid-js';
import css from '../../styles/components/contextBanner.module.css';
import { StoreContext } from '../../contexts/storeContext';
import { getCurrentExpState } from '../../stateManager/getCurrentExpState';
import { ScreenOrientation } from '../../contexts/screenOrientationContext';


// This banner will be almost always visible and display the current mode, focused thought title, profile name
// or any other "current state"
// eg. Settings, Big graph, _birds, A thought about dogs, UserMcFakename, 
export default function ContextBanner() {
  const store = useContext(StoreContext)!;
  const screenOrientation = useContext(ScreenOrientation)

  const [text, setText] = createSignal('Aphantasia');
  const [color, setColor] = createSignal('#cccccc');

  createEffect(() => {
    const currentMode = getCurrentExpState(store).mode;
    if (currentMode === 'welcome_create') {
      setText('What\'s on your mind?')
      setColor('#a0a0a0')
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
      setColor(store.get.contextThought?.color ?? '#cccccc');
    }
    if (currentMode === 'create') {
      setText('What\'s on your mind?')
      setColor('#a0a0a0')
      return;
    }
    if (currentMode === 'epochs' && !getCurrentExpState(store).focus) {
      setText('Aphantasia');
      setColor('#cccccc');
    }
  })

  return <div classList={{
    [css.context_banner_container]: true,
    [css.context_banner_container_align_left]: store.get.splitUiLayout === 'half' && screenOrientation.isLandscape()
  }} style={{
    border: `2px solid ${color()}`
  }}
    onClick={() => {
      if (getCurrentExpState(store).mode === 'explore' || getCurrentExpState(store).mode === 'welcome')
        store.get.grafika.focusOn({ id: store.get.contextThought?.id ?? '' });
      if (getCurrentExpState(store).mode === 'epochs' && !getCurrentExpState(store).focus)
        store.get.grafika.focusOn('all');
      if (getCurrentExpState(store).mode === 'welcome_create')
        store.get.grafika.focusOn({ id: 'created_thought' })
    }}>
    <h1 style={{ color: color() }}>
      {text()}
    </h1>
  </div>
}