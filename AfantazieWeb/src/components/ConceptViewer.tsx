import { conceptDto } from "../api/dto/ConceptDto";

interface ConceptViewerProps {
    concept: conceptDto | null,
    closeConceptViewer: () => void,
}

const PUBLIC_FOLDER = import.meta.env.VITE_PUBLIC_FOLDER;

export const ConceptViewer = (props: ConceptViewerProps) => {
    return <>

        {props.concept &&
            <>
                <div className="profile-viewer-container" style={{ borderColor: props.concept.color }}>
                    <div className="profile-viewer-top-row" >
                        <div className="profile-viewer-title" style={{ color: props.concept.color }} >{props.concept.tag}</div>
                    </div>
                    {/* <p className={"profile-viewer-content"}>
                        {props.concept.bio}
                    </p> */}
                    {/* <div className="profile-viewer-botom-row">
                        <div className="profile-viewer-date" style={{ color: props.concept.color }}>
                            {props.concept.totalCount}</div>
                        <div className="profile-viewer-date">{props.concept.joinedDate}</div>
                    </div> */}
                </div>
                <div className='profile-viewer-controls-container'>
                    <div className='profile-viewer-controls'>

                        <button className='profile-viewer-controls-button' onClick={props.closeConceptViewer}>
                            <img draggable='false' src={PUBLIC_FOLDER + '/icons/close.svg'}></img>
                        </button>

                        {/* Follow */}
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