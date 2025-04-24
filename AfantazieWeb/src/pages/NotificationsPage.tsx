import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Localization } from "../locales/localization";
import { notificationDto } from "../api/dto/NotificationDto";
import { fetchNotifications, markAsRead } from "../api/notificationsApiClient";
import { useGraphStore } from "./graph/state_and_parameters/GraphStore";

export const NotificationsPage = () => {
    const [notifications, setNotifications] = useState<notificationDto[]>([]);
    const navigate = useNavigate();
    const setHasUnread = useGraphStore(state => state.setHasUnreadNotifications);

    useEffect(() => {
        const fetchNotificationsAsync = async () => {
            const response = await fetchNotifications(50);
            if (response.ok) {
                setNotifications(response.data!);
            } else {
                console.error("Failed to fetch notifications:", response.error);
                return;
            }
            if (response.data?.length === 0) {
                setNotifications([{
                    id: 0, color: "#aaaaaa", thoughtTitle: Localization.NoNotifications,
                    thoughtAuthor: undefined, dateCreated: "", isRead: true, type: 0, thoughtId: undefined
                }]);
                //todo add a special element for empty reply thoughts?
            }

            if (response.data!.filter(n => !n.isRead).length > 0) {
                setHasUnread(true);
            } else {
                setHasUnread(false);
            }
        };

        fetchNotificationsAsync();
    }, []);

    const handleNotificationClickClick = (notification: notificationDto, middleMouse: boolean) => {
        if (!notification.isRead) {
            markAsRead(notification.id).then(response => {
                if (!response.ok) {
                    console.error("Failed to mark notification as read:", response.error);
                }
            });
            notification.isRead = true;

            if (notifications.filter(notification => !notification.isRead).length === 0) {
                setHasUnread(false);
            }
        }

        if (notification.thoughtId) {
            if (middleMouse) {
                window.open('/graph/' + notification.thoughtId);
            }
            else {
                navigate('/graph/' + notification.thoughtId);
            }
        }
    }

    return (
        <div className="content-container notifications-content-container">
            {notifications.filter(notification => !notification.isRead).length > 0 &&
                <>
                    {Localization.Unread}
                    <div className="log-container">
                        {notifications.filter(notification => !notification.isRead).map((notification, index) => (
                            <div key={index} className="log" style={{ borderColor: notification.color }}
                                onClick={_ => handleNotificationClickClick(notification, false)}
                                onMouseDown={e => {
                                    if (e.button === 1) {
                                        handleNotificationClickClick(notification, true);
                                    }
                                }}>
                                <div className="log-thought-title">{notification.thoughtTitle}</div>
                                <div className="log-bottom-row">
                                    <div className="log-author" style={{ color: notification.color }}>{notification.thoughtAuthor}</div>
                                    {import.meta.env.VITE_LANGUAGE === 'cz' && <>
                                        <div className="log-date">{Localization.Before} {notification.dateCreated}</div>
                                    </>}
                                    {import.meta.env.VITE_LANGUAGE === 'en' && <>
                                        <div className="log-date">{notification.dateCreated} {Localization.Before}</div>
                                    </>}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            }
            {notifications.filter(notification => notification.isRead).length > 0 &&
                <>
                    {Localization.Read}
                    <div className="log-container">
                        {notifications.filter(notification => notification.isRead).map((notification, index) => (
                            <div key={index} className="log" style={{ borderColor: notification.color }}
                                onClick={_ => handleNotificationClickClick(notification, false)}
                                onMouseDown={e => {
                                    if (e.button === 1) {
                                        handleNotificationClickClick(notification, true);
                                    }
                                }}>
                                <div className="log-thought-title">{notification.thoughtTitle}</div>
                                <div className="log-bottom-row">
                                    <div className="log-author" style={{ color: notification.color }}>{notification.thoughtAuthor}</div>
                                    {import.meta.env.VITE_LANGUAGE === 'cz' && <>
                                        <div className="log-date">{Localization.Before} {notification.dateCreated}</div>
                                    </>}
                                    {import.meta.env.VITE_LANGUAGE === 'en' && <>
                                        <div className="log-date">{notification.dateCreated} {Localization.Before}</div>
                                    </>}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            }

        </div>
    )
}