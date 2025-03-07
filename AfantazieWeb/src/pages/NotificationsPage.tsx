import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { thoughtNodeDto } from "../api/dto/ThoughtDto";
import { fetchNotifications } from "../api/graphClient";
import { Localization } from "../locales/localization";

export const NotificationsPage = () => {
    const [notifications, setNotifications] = useState<thoughtNodeDto[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchNotificationsAsync = async () => {
            const response = await fetchNotifications(40);
            if (response.ok) {
                setNotifications(response.data!);
            }
            if (response.data?.length === 0) {
                setNotifications([{ color: "#aaaaaa", title: Localization.NoNotifications, author: "", dateCreated: "", id: 0, size: 1, backlinks: [], links: [] }]);
                //todo add a special element for empty reply thoughts?
            }
        };
        fetchNotificationsAsync();
    }, []);

    return (
        <div className="content-container notifications-content-container">
            <div className="log-container">
                {notifications.map((thought, index) => (
                    <div key={index} className="log" style={{ borderColor: thought.color }} onClick={_ => navigate('/graph/' + thought.id)}>
                        <div className="log-thought-title">{thought.title}</div>
                        <div className="log-bottom-row">
                            <div className="log-author" style={{ color: thought.color }}>{thought.author}</div>
                            {import.meta.env.VITE_LANGUAGE === 'cz' && <>
                                <div className="log-date">{Localization.Before} {thought.dateCreated}</div>
                            </>}
                            {import.meta.env.VITE_LANGUAGE === 'en' && <>
                                <div className="log-date">{thought.dateCreated} {Localization.Before}</div>
                            </>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}