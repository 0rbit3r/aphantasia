import { createEffect, createSignal, useContext } from 'solid-js';
import { AphantasiaStoreContext } from '../contexts/aphantasiaStoreContext';
import css from '../styles/components/contextBanner.module.css';
import { isThought } from '../utility/isTypeOf';
import type { Thought } from '../model/dto/thought';
import { getCurrentExpState } from '../stateManager/getCurrentExpState';
import { ScreenOrientation } from '../contexts/screenOrientationContext';


// This banner will be almost always visible and display the current mode, focused thought title, profile name
// or any other "current state"
// eg. Settings, Big graph, _birds, A thought about dogs, User with no name, 
export default function ContextBanner() {
  const store = useContext(AphantasiaStoreContext)!;
  const screenOrientation = useContext(ScreenOrientation)

  const [text, setText] = createSignal('Aphantasia');
  const [color, setColor] = createSignal('#cccccc');

  createEffect(() => {
    if (store.get.contextDataLoading) {
      setText('Loading...');
      setColor('#999999');
      return;
    }
    if (isThought(store.get.contextData)) {
      setText((store.get.contextData as Thought).title);
      setColor((store.get.contextData as Thought).author.color);
    }
    if (store.get.contextData === undefined && getCurrentExpState(store).mode === 'epochs'){
      setText('Aphantasia');
      setColor('#cccccc');
    }
  })

  return <div classList={{
    [css.context_banner_container]: true,
    [css.context_banner_container_align_left]: store.get.splitUiLayout === 'half' && screenOrientation.isLandscape()
  }} style={{ 
    border: `2px solid ${color()}`}}>
    <h1 style={{ color: color() }} onClick={() => {
      if (isThought(store.get.contextData))
        store.get.grafika.focusOn({ id: (store.get.contextData as Thought)?.id ?? '' });
      if (store.get.contextData === undefined && getCurrentExpState(store).mode === 'epochs')
        store.get.grafika.focusOn('all');
    }}>
      {text()}
    </h1>
  </div>
}