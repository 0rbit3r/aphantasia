import { createEffect, Show, useContext } from 'solid-js';
import css from '../../styles/components/messageOverlay.module.css';
import { StoreContext } from '../../contexts/storeContext';

type MessageOverlayColor = "red" | "green" | "yellow";

export interface Notification {
  color: MessageOverlayColor;
  text: string;
}

// todo use these for validation, confirmation or warnings (low fps?)

// This will display important info over the entire screen or over the graph part or somewhere nicely visible
// Things like "No connection", "Profile updated", "Thought created" ...
export default function MessageOverlay() {
  const store = useContext(StoreContext)!;

  createEffect(() => {
    if (store.get.notificationMessages.length === 0) return;
    setTimeout(() => { store.set('notificationMessages', store.get.notificationMessages.slice(1)) }, 5000)
  })

  return <Show when={store.get.notificationMessages.length > 0}>
    <div
      class={css.message_container_overlay}>
      {store.get.notificationMessages.map(n =>
        <div classList={{
          [css.message]: true,
          [css.red_message]: n.color === 'red',
          [css.green_message]: n.color === 'green',
          [css.yellow_message]: n.color === 'yellow'
        }}>
          {n.text}
        </div>)}
    </div>
  </Show >
}