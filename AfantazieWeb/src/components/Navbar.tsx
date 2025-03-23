import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../Contexts/AuthContext';
import { Localization } from '../locales/localization';
import { useGraphStore } from '../pages/graph/state_and_parameters/GraphStore';

function Navbar() {

    const [menuExpanded, setMenuExpanded] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);

    const { isAuthenticated } = useAuth();

    const navigate = useNavigate();
    const userSettings = useGraphStore(state => state.userSettings);

    const handleExpansion = () => {
        if (menuExpanded) {
            console.log('closing menu');
            setTimeout(() => {
                setMenuVisible(!menuVisible);
            }, 300);
        }
        else {
            setMenuVisible(!menuVisible);
        }

        setMenuExpanded(!menuExpanded);
    }

    const handleClick = () => {
        if (menuExpanded) {
            handleExpansion();
        }
    };

    return (
        <>
            <div className='top-row'>

                <a className='aphantasia-title' onClick={() => navigate("home")} style={{color: userSettings?.color}}
                onMouseDown={e => {if (e.button === 1){window.open('https://aphantasia.io/home')}}}>{Localization.Title}</a>

                {/* <div className='aphantasia-title-logged-out' onClick={() => navigate("/")}>{Localization.Title}</div> */}

                <div className='top-row-icons-container'>
                    {(isAuthenticated &&
                        <>
                            <NavLink to="/create-thought" className='top-row-button'>
                                <svg width="30px" height="30px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier"
                                        strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier">
                                        <path d="M7 5C5.34315 5 4 6.34315 4 8V16C4 17.6569 5.34315 19 7 19H17C18.6569 
                         19 20 17.6569 20 16V12.5C20 11.9477 20.4477 11.5 21 11.5C21.5523 11.5 22 11.9477
                         22 12.5V16C22 18.7614 19.7614 21 17 21H7C4.23858 21 2 18.7614 2 16V8C2 5.23858 4.23858 
                          3 7 3H10.5C11.0523 3 11.5 3.44772 11.5 4C11.5 4.55228 11.0523 5 10.5 5H7Z" fill="currentColor">
                                        </path> <path fillRule="evenodd" clipRule="evenodd" d="M18.8431 3.58579C18.0621 2.80474 
                            16.7957 2.80474 16.0147 3.58579L11.6806 7.91992L11.0148 11.9455C10.8917 12.6897 11.537 13.3342 
                            12.281 13.21L16.3011 12.5394L20.6347 8.20582C21.4158 7.42477 21.4158 6.15844 20.6347 5.37739L18.8431
                            3.58579ZM13.1933 11.0302L13.5489 8.87995L17.4289 5L19.2205 
                            6.7916L15.34 10.6721L13.1933 11.0302Z" fill="currentColor"></path> </g></svg>
                            </NavLink>
                            <NavLink to="/zvoneček" onClick={handleClick} className='top-row-button'>
                                <svg className="w-[48px] h-[48px] text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="30px" height="30px" fill="none" viewBox="0 0 24 24">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5.365V3m0 2.365a5.338 5.338 0 0 1 5.133 5.368v1.8c0 2.386 1.867 2.982 1.867 4.175 0 .593 0 1.292-.538 1.292H5.538C5
                             18 5 17.301 5 16.708c0-1.193 1.867-1.789 1.867-4.175v-1.8A5.338 5.338 0 0 1 12 5.365ZM8.733 18c.094.852.306 1.54.944 2.112a3.48 3.48 0 0 0 4.646 0c.638-.572 1.236-1.26 1.33-2.112h-6.92Z" />
                                </svg>
                            </NavLink>
                        </>)}
                    <div className='menu-button' onClick={handleExpansion}>
                        {(!menuExpanded
                            && <svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="3" y1="12" x2="21" y2="12"></line>
                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                <line x1="3" y1="18" x2="21" y2="18"></line>
                            </svg>
                            || <svg fill="#000000" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" width="38px" height="38px">
                                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                                <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                                <g id="SVGRepo_iconCarrier">
                                    <path d="M18.8,16l5.5-5.5c0.8-0.8,0.8-2,0-2.8l0,0C24,7.3,23.5,7
                            ,23,7c-0.5,0-1,0.2-1.4,0.6L16,13.2l-5.5-5.5 c-0.8-0.8-2.1-0.8-2.8,
                            0C7.3,8,7,8.5,7,9.1s0.2,1,0.6,1.4l5.5,5.5l-5.5,5.5C7.3,21.9,7,22.4,
                            7,23c0,0.5,0.2,1,0.6,1.4 C8,24.8,8.5,25,9,25c0.5,0,1-0.2,1.4-0.6l5.5
                            -5.5l5.5,5.5c0.8,0.8,2.1,0.8,2.8,0c0.8-0.8,0.8-2.1,0-2.8L18.8,16z">
                                    </path> </g></svg>)}
                    </div>
                </div>
            </div>

            {(menuVisible && <div className={`menu
            ${menuExpanded
                    ? isAuthenticated
                        ? 'menu-long-expanded'
                        : 'menu-short-expanded'
                    : ""
                }`}>
                <div className='menu-link-container' onClick={() => {navigate("/graph"); handleClick();}}>
                    <NavLink to="/graph" className={({ isActive }) =>
                        'menu-link' + (isActive ? ' menu-link-active' : '')}>
                        {Localization.MenuGraph}
                    </NavLink>
                </div>
                {!isAuthenticated && (
                    <>
                        <div className='menu-link-container' onClick={() => {navigate("/login"); handleClick();}}>
                            <NavLink to="/login"  className={({ isActive }) =>
                                'menu-link' + (isActive ? ' menu-link-active' : '')}>
                                {Localization.MenuLogin}
                            </NavLink>
                        </div>
                        <div className='menu-link-container' onClick={() => {navigate("/register"); handleClick();}}>
                            <NavLink to="/register" className={({ isActive }) =>
                                'menu-link' + (isActive ? ' menu-link-active' : '')}>
                                {Localization.MenuRegister}
                            </NavLink>
                        </div>
                    </>)}
                {isAuthenticated && (
                    <>
                        <div className='menu-link-container' onClick={() => {navigate("/home"); handleClick();}}>
                            <NavLink to="/home" className={({ isActive }) =>
                                'menu-link' + (isActive ? ' menu-link-active' : '')}>
                                {Localization.MenuHome}
                            </NavLink>
                        </div>
                        <div className='menu-link-container' onClick={() => {navigate("/chat"); handleClick();}}>
                            <NavLink to="/chat" className={({ isActive }) =>
                                'menu-link' + (isActive ? ' menu-link-active' : '')}>
                                {Localization.MenuChat}
                            </NavLink>
                        </div>
                        <div className='menu-link-container' onClick={() => {navigate("/user"); handleClick();}}>
                            <NavLink to="/user" className={({ isActive }) =>
                                'menu-link' + (isActive ? ' menu-link-active' : '')}>
                                {Localization.MenuSettings}
                            </NavLink>
                        </div>
                    </>)}
                <div className='menu-link-container' onClick={() => {navigate("/about"); handleClick();}}>
                    <NavLink to="/about" className={({ isActive }) =>
                        'menu-link' + (isActive ? ' menu-link-active' : '')}>
                        {Localization.MenuAbout}
                    </NavLink>
                </div>
            </div>
            )}
        </>
    )
}

export default Navbar