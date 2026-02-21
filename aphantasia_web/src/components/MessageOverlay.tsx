import css from '../styles/components/messageOverlay.module.css';

type MessageOverlayColor = "red" | "green" | "yellow";
// todo use these for validation, confirmation or warnings (low fps?)

interface MessageOverlayProps {
    text: string | null;
    color: MessageOverlayColor;
}

// This will display important info over the entire screen or over the graph part or somewhere nicely visible
// Things like "No connection", "Profile updated", "Thought created" ...
export default function MessageOverlay(props: MessageOverlayProps) {
  


  return <div 
  classList={{
    [css.message_container_overlay]: true,
    [css.red_message]: props.color === 'red',
    [css.green_message]: props.color === 'green',
    [css.yellow_message]: props.color === 'yellow',
  }}>
    {props.text}
  </div>
}