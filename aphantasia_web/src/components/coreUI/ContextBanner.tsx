import { createEffect, createSignal, useContext } from 'solid-js';
import css from '../../styles/components/contextBanner.module.css';
import { StoreContext } from '../../contexts/storeContext';
import { getCurrentExpState } from '../../stateManager/getCurrentExpState';
import { ScreenOrientation } from '../../contexts/screenOrientationContext';
import { MODE_CONTRACTS } from '../../stateManager/modes/modeContract';

// This banner will be almost always visible and display the current mode, focused thought title, profile name
// or any other "current state"
// eg. Settings, Big graph, _birds, A thought about dogs, UserMcFakename,
export default function ContextBanner() {
  const store = useContext(StoreContext)!;
  const screenOrientation = useContext(ScreenOrientation)

  const [text, setText] = createSignal('Aphantasia');
  const [color, setColor] = createSignal('#cccccc');

  createEffect(() => {
    const currentModeContract = MODE_CONTRACTS[getCurrentExpState(store).mode];
    if (store.get.contextDataLoading && !currentModeContract.contextBanner.skipLoadingOverride) {
      setText('Loading...');
      setColor('#999999');
      return;
    }
    setText(currentModeContract.contextBanner.text(store));
    setColor(currentModeContract.contextBanner.color(store));
  })

  return <div classList={{
    [css.context_banner_container]: true,
    [css.context_banner_container_align_left]: store.get.splitUiLayout === 'half' && screenOrientation.isLandscape()
  }} style={{
    border: `2px solid ${color()}`
  }}
    onClick={() => MODE_CONTRACTS[getCurrentExpState(store).mode].contextBanner.onClick(store)}>
    <h1 style={{ color: color() }}>
      {text()}
    </h1>
  </div>
}
