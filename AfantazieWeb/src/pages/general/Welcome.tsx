import { NavLink } from "react-router-dom"
import ThoughtLogViewer from "../../components/log/LogViewer";
import { Localization } from "../../locales/localization";


function Welcome() {
    return (
        <div className="content-container home-container">
            <h1>{Localization.Title}</h1>
            <h2 className="quip">{Localization.Quips[Math.floor(Math.random() * Localization.Quips.length)]}</h2>
            <div className="hero">
                {/* <div>
                    <img className="map" src="map.png" alt="mapa" />
                </div>
                    <div>Online: {onlineUsers}</div> */}
                <ThoughtLogViewer></ThoughtLogViewer>
                {/* <div className="hero-text">
                </div> */}
            </div>
            {/* <Rules></Rules> */}
            <div className="center">
                <NavLink to="/graph">
                    <button className="button-primary home-action-button">{Localization.Graph}</button>
                </NavLink>
            </div>
            <div className="center">
                <NavLink to="/login">
                    <button className="button-primary home-action-button">{Localization.LoginButton}</button>
                </NavLink>
            </div>
            <div className="center">
                <NavLink to="/about">
                    <button className="button-secondary home-action-button">{Localization.WhatsThisAbout}</button>
                </NavLink>
            </div>
            <div className="center">
                <NavLink to="/register">
                    <button className="button-secondary home-action-button">{Localization.RegisterButton}</button>
                </NavLink>
            </div>
        </div>
    )
}

export default Welcome