import { useContext } from "solid-js"
import { StoreContext } from "../../contexts/storeContext";
import { NotificationCard } from "./NotificationCard";
import css from '../../styles/components/inbox.module.css';
import buttonCss from '../../styles/common/buttons.module.css';
import { api_MarkAllNotificationsAsRead } from "../../api/api_notifications";

export const Inbox = () => {
    const store = useContext(StoreContext)!;

    return <div class={css.inbox_container}>
        <button class={`${buttonCss.common_button} ${css.load_more_button}`}
            on:click={_ => api_MarkAllNotificationsAsRead()
                .then(_ => {
                    store.set('screenMessages', prev => [...prev, {
                        color: 'green', text: 'Notifications marked as read'
                    }]);
                    store.set('contextInbox',prev => prev?.map(n => ({...n, read: true})));
                })
                .catch(e => store.set('screenMessages', prev => [...prev, {
                    color: 'red', text: e
                }]))}
        >Mark all as read</button>
        {store.get.contextInbox?.map(n => <NotificationCard notification={n} />)}

        <button class={`${buttonCss.common_button} ${css.load_more_button}`}
            on:click={_ => store.set('screenMessages', prev => [...prev, {
                color: 'yellow', text: 'What more do you want? This website has been existing for like a week... '
            }])}
        >Load more</button>
    </div>
}