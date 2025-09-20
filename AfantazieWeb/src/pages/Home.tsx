import { NavLink, useLocation } from "react-router-dom"
import ThoughtListViewer from "../components/ThoughtLogViewer";
import { useOnlineUsers } from "../Contexts/RealtimeStatsContext";
import { MessageLocationState } from "../interfaces/LocationState";
import { Localization } from "../locales/localization";
import { useGraphStore } from "./graph/state_and_parameters/GraphStore";
import { useEffect } from "react";
import { fetchHasUnread } from "../api/notificationsApiClient";


function Home() {

    const onlineUsers = useOnlineUsers();
    const location = useLocation();
    const message = (location.state as MessageLocationState)?.message;

    const userColor = useGraphStore(state => state.userSettings.color);
    const setHasUnread = useGraphStore(state => state.setHasUnreadNotifications);

    const fetchAndSetHasUnreadFlag = async () => {
        await fetchHasUnread().then((response) => {
            if (response.status === 200) {
                setHasUnread(response.data!);
            }
        });
    };

    useEffect(() => {
        fetchAndSetHasUnreadFlag();
    }, []);

    return (
        <div className="content-container home-container">
            <h2 className="quip">{Localization.Quips[Math.floor(Math.random() * Localization.Quips.length)]}</h2>
            <div className="online-users-counter" style={{color: userColor}}>Online: {onlineUsers}</div>
            {message &&
            <p className="center">
                {message}
            </p>}
            <div className="hero">
                <ThoughtListViewer source="latest"></ThoughtListViewer>
                <ThoughtListViewer source="hot"></ThoughtListViewer>
                <ThoughtListViewer source="biggest"></ThoughtListViewer>
                <ThoughtListViewer source="pinned"></ThoughtListViewer>
                {/* <div className"hero-text">
                </div> */}
            </div>
            <div className="center">
                <NavLink to="/graph">
                    <button className="button-primary home-action-button">{Localization.Graph}</button>
                </NavLink>
            </div>
            <div className="center">
                <NavLink to="/chat">
                    <button className="button-secondary home-action-button">Chat</button>
                </NavLink>
            </div>
            <div className="center">
                <NavLink to="/user">
                    <button className="button-secondary home-action-button">{Localization.UserSettings}</button>
                </NavLink>
            </div>
        </div>
    )
}

export default Home