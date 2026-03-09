import { createEffect, createSignal, useContext } from 'solid-js';
import css from '../../styles/components/contextBanner.module.css';
import { AphantasiaStoreContext } from '../../contexts/aphantasiaStoreContext';
import type { Thought } from '../../model/dto/thought';
import { getCurrentExpState } from '../../stateManager/getCurrentExpState';
import { isThought, isThoughtInMaking } from '../../utility/isTypeOf';
import { ScreenOrientation } from '../../contexts/screenOrientationContext';
import type { ThoughtInMaking } from '../../model/ThoughtInMaking';


// This banner will be almost always visible and display the current mode, focused thought title, profile name
// or any other "current state"
// eg. Settings, Big graph, _birds, A thought about dogs, User with no name, 
export default function ContextBanner() {
  const store = useContext(AphantasiaStoreContext)!;
  const screenOrientation = useContext(ScreenOrientation)

  const [text, setText] = createSignal('Aphantasia');
  const [color, setColor] = createSignal('#cccccc');

  createEffect(() => {
    if (getCurrentExpState(store).mode === 'welcome_create') {

      setText('What\'s on your mind?')
      setColor('#a0a0a0')
      return;
    }
    if (store.get.contextDataLoading) {
      setText('Loading...');
      setColor('#999999');
      return;
    }
    if (isThought(store.get.contextData)) {
      setText((store.get.contextData as Thought).title);
      setColor((store.get.contextData as Thought).author.color);
    }
    if (isThoughtInMaking(store.get.contextData)) {
      setText((store.get.contextData as ThoughtInMaking).title)
    }
    if (store.get.contextData === undefined && getCurrentExpState(store).mode === 'epochs') {
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
      if (isThought(store.get.contextData))
        store.get.grafika.focusOn({ id: (store.get.contextData as Thought)?.id ?? '' });
      if (store.get.contextData === undefined && getCurrentExpState(store).mode === 'epochs')
        store.get.grafika.focusOn('all');
    }}>
    <h1 style={{ color: color() }}>
      {text()}
    </h1>
  </div>
}