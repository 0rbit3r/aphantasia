import { useEffect, useState } from "react";
import { NotificationDto } from "../../api/dto/NotificationDto";
import { useNavigate } from "react-router-dom";
import { getNotifications } from "../../api/graphClient";
import { Localization } from "../../locales/localization";

export const NotificationsPage = () => {
    const [notifications, setNotifications] = useState<NotificationDto[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchNotificationsAsync = async () => {
            const response = await getNotifications();
            if (response.ok) {
                setNotifications(response.data!.reverse());
            }
            if (response.data?.length === 0) {
                setNotifications([{color: "#aaaaaa", text: Localization.NoNotifications, time: "", title: ""}]);
            }
        };
        fetchNotificationsAsync();
    }, []);

    return (
        <div className="content-container">
            <div className="list-container">
                {notifications.map((notification, index) => (
                    <div key={index} className="thought" style={{ borderColor: notification.color }} onClick={_ => { if (notification.link) navigate(notification.link) }}>
                        <div className="notification-header">
                            <span className="notification-title">{notification.title}</span>
                            <span className="notification-time">{notification.time}</span>
                        </div>
                        <div className="thought-title">{notification.text}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}