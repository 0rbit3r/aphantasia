import type { InboxNotification } from "../../model/dto/inboxNotification"
import css from '../../styles/components/notificationCard.module.css';
import circleIcon from '../../assets/icons/circle.svg';
import squareIcon from '../../assets/icons/square.svg';
import diamondIcon from '../../assets/icons/diamond.svg';
import triangleIcon from '../../assets/icons/triangle.svg';
import downTriangleIcon from '../../assets/icons/down-triangle.svg';
import crossIcon from '../../assets/icons/cross.svg';
import heartIcon from '../../assets/icons/heart.svg';
import { Match, Switch, useContext } from "solid-js";
import { NodeShape } from "grafika";
import { handleForwardExploration } from "../../stateManager/handleForwardExploration";
import { StoreContext } from "../../contexts/storeContext";
import { api_MarkNotificationAsRead } from "../../api/api_notifications";


export const NotificationCard = (props: { notification: InboxNotification }) => {
    const store = useContext(StoreContext)!;

    return <div classList={{[css.notification_card]: true, [css.notification_card_unread]: !props.notification.read}}
        style={{ ['border-color']: props.notification.thought?.color ?? 'white' }}
        on:click={_ => {
            if (props.notification.thought)
                handleForwardExploration(store, { mode: 'explore', focus: props.notification.thought.id });
            else
                store.set('screenMessages', prev => [...prev, {
                    color: 'yellow', text: 'This notification is thought-less'
                }]);
            api_MarkNotificationAsRead(props.notification.id);
        }}>
        <div class={css.title_and_shape}>
            <div class={css.title}
                style={{ color: props.notification.thought?.color ?? 'white' }}>
                {props.notification.text ?? props.notification.thought?.title}
            </div>
            <div class={css.shape_icon}>
                <Switch>
                    <Match when={props.notification.thought?.shape === NodeShape.Circle}>
                        <img src={circleIcon}></img>
                    </Match>
                    <Match when={props.notification.thought?.shape === NodeShape.Square}>
                        <img src={squareIcon}></img>
                    </Match>
                    <Match when={props.notification.thought?.shape === NodeShape.Diamond}>
                        <img src={diamondIcon}></img>
                    </Match>
                    <Match when={props.notification.thought?.shape === NodeShape.UpTriangle}>
                        <img src={triangleIcon}></img>
                    </Match>
                    <Match when={props.notification.thought?.shape === NodeShape.DownTriangle}>
                        <img src={downTriangleIcon}></img>
                    </Match>
                    <Match when={props.notification.thought?.shape === NodeShape.Cross}>
                        <img src={crossIcon}></img>
                    </Match>
                    <Match when={props.notification.thought?.shape === NodeShape.Heart}>
                        <img src={heartIcon}></img>
                    </Match>
                </Switch>
            </div>
        </div>
        <div class={css.date_and_user}>
            <div>{props.notification.dateCreated}</div>
            <div class={css.username}
                style={{ color: props.notification.fromUser?.color ?? 'white' }}>
                {props.notification.fromUser?.username}</div>
        </div>
    </div>
}