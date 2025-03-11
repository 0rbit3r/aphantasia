import { NavLink, useLocation } from "react-router-dom"
import ThoughtLogViewer from "../components/LogViewer";
import { useOnlineUsers } from "../Contexts/RealtimeStatsContext";
import { LocationState } from "../interfaces/LocationState";
import { Localization } from "../locales/localization";


function Home() {

    const onlineUsers = useOnlineUsers();

    const location = useLocation();
    const message = (location.state as LocationState)?.message;

    return (
        <div className="content-container home-container">
            <div className="online-users-counter">Online: {onlineUsers}</div>
            {/* <h2 className="quip">{Localization.Quips[Math.floor(Math.random() * Localization.Quips.length)]}</h2> */}
            {message &&
            <p className="center">
                {message}
            </p>}
            <div className="hero">
                <ThoughtLogViewer source="latest"></ThoughtLogViewer>
                <ThoughtLogViewer source="hot"></ThoughtLogViewer>
                <ThoughtLogViewer source="notifications"></ThoughtLogViewer>
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