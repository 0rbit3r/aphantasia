import { userProfileDto } from "../api/dto/userProfileDto";

interface ProfileViewerProps {
    profile: userProfileDto | null,
    closeProfileViewer: () => void,
}

const PUBLIC_FOLDER = import.meta.env.VITE_PUBLIC_FOLDER;

export const ProfileViewer = (props: ProfileViewerProps) =>  {
    return  <>
    
            {props.profile &&
            <>
                <div className="profile-viewer-container" style={{ borderColor: props.profile.color }}>
                    <div className="profile-viewer-top-row" >
                        <div className="profile-viewer-title" style={{ color: props.profile.color }} >{props.profile.username}</div>
                    </div>
                    <p className={"profile-viewer-content"}>
                        {props.profile.bio}
                    </p>
                    <div className="profile-viewer-botom-row">
                    <div className="profile-viewer-date" style={{ color: props.profile.color }}>
                        {props.profile.totalCount}</div>
                    <div className="profile-viewer-date">{props.profile.joinedDate}</div>
                </div>
                </div>
                <div className='profile-viewer-controls-container'>
                    <div className='profile-viewer-controls'>
    
                        <button className='profile-viewer-controls-button' onClick={props.closeProfileViewer}>
                            <img draggable='false' src={PUBLIC_FOLDER + '/icons/close.svg'}></img>
                        </button>
    
                        Follow
                        {/* <button className='profile-viewer-controls-button' onClick={() => { props.setExtendedHeight(!extendedHeight) }}>
                            {extendedHeight
                                ? <img draggable='false' src={PUBLIC_FOLDER + '/icons/minimize.svg'}></img>
                                : <img draggable='false' src={PUBLIC_FOLDER + '/icons/fullscreen.svg'}></img>
                            }
                        </button> */}
                    </div>
                </div>
                </>
                }
            </>
};