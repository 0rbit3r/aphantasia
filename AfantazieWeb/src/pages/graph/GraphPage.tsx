import React, { useEffect, useRef, useState } from 'react';
import { Stage } from '@pixi/react';
import { fullThoughtDto } from '../../api/dto/ThoughtDto';
import { useParams } from 'react-router-dom';
import { useGraphStore } from './state_and_parameters/GraphStore';
import GraphContainer from './GraphContainer';
import { fetchTemporalThoughts, fetchThought } from '../../api/graphClient';
import { clearNeighborhoodThoughts, mapDtosToRenderedThoughts, updateNeighborhoodThoughts } from './simulation/thoughtsProvider';
import { ThoughtViewer } from '../../components/ThoughtViewer';
import GraphControls from '../../components/GraphControls';
import { fetchUserProfile } from '../../api/userProfileApi';
import { useGraphControlsStore } from './state_and_parameters/GraphControlsStore';

const COLOR_BACKGROUND = 0x000000;

const PUBLIC_FOLDER = import.meta.env.VITE_PUBLIC_FOLDER;

const initialStageSize = { width: window.innerWidth, height: window.innerHeight - 40 };
const landscapeMode = initialStageSize.width > initialStageSize.height;


const GraphPage: React.FC = () => {
    // navigation
    // const navigate = useNavigate();
    const [initialHighlightedThoughtId, setInitialHighlightedThoughtId] = useState<number | null | undefined>(undefined);
    const { urlThoughtId } = useParams();

    // data
    const temporalThoughts = useGraphStore((state) => state.temporalRenderedThoughts);
    const setTemporalThoughts = useGraphStore((state) => state.setTemporalRenderedThoughts);
    const neighborhoodThoughts = useGraphStore((state => state.neighborhoodThoughts));
    const setNeighborhoodThoughts = useGraphStore((state => state.setNeighborhoodThoughts));
    const setBeginningThoughtId = useGraphStore((state) => state.setBeginningThoughtId);

    // const [replies, setReplies] = useState<thoughtNodeDto[]>([]);

    // screen state
    const [overlayVisible, setOverlayVisible] = useState(false);
    // const viewport = useGraphStore((state) => state.viewport);

    // controls
    const [zoomingHeld, setZoomingHeld] = useState(0);
    const setZoomingControl = useGraphStore((state) => state.setZoomingControl);
    const neighborhoodEnabled = useGraphControlsStore((state) => state.neighborhoodEnabled);

    const highlightedThought = useGraphStore((state) => state.highlightedThought);
    const setHighlightedThoughtId = useGraphStore((state) => state.setHighlightedThoughtById);
    const unsetHighlightedThought = useGraphStore((state) => state.unsetHighlightedThought);

    const [fullHighlightedThought, setfullHighlightedThought] = useState<fullThoughtDto | null>(null);

    // const timeShiftControl = useGraphStore((state) => state.timeShiftControl);
    // const setTimeShiftControl = useGraphStore((state) => state.setTimeShiftControl);
    const setTimeShift = useGraphStore((state) => state.setTimeShift);
    const setEndingThoughtId = useGraphStore((state) => state.setEndingThoughtId);



    // const setMaxThoughtsOnScreen = useGraphStore((state) => state.setMaxThoughtsOnScreen);

    const scrollContainer = useRef<HTMLDivElement>(null);

    // Initialize the graph page (including zusand store)
    useEffect(() => {
        const fetchAndSetEndingThought = async () => {
            fetchTemporalThoughts({ amount: 1 }).then(response => {
                if (response.ok && response.data!.length > 0) {
                    setEndingThoughtId(response.data![0].id)
                }
            })
            setEndingThoughtId(0);
        }
        fetchAndSetEndingThought();

        unsetHighlightedThought();
        setTimeShift(0);
        setTemporalThoughts([]);
        setNeighborhoodThoughts([]);


        // set initial highlighted thought
        if (urlThoughtId) {
            // console.log("urlThoughtId: ", urlThoughtId)
            if (urlThoughtId === 'now') {
                setInitialHighlightedThoughtId(null);
                setTimeShift(-1);
                // setNewestDate(Localization.RightNow);

                //todo - create handler for live preview (called from url and by button)

                return;
            }
            const id = parseInt(urlThoughtId);
            if (!isNaN(id)) {
                setInitialHighlightedThoughtId(id);
            }
        }
        else {
            setInitialHighlightedThoughtId(null);
        }
    }, []);

    //handle content fetching when highlighted thought changes
    useEffect(() => {
        // console.log("highlighted thought changed to ", highlightedThought)
        if (highlightedThought !== null) {
            fetchThought(highlightedThought.id).then(response => {
                if (response.ok) {
                    setfullHighlightedThought(response.data!);
                    updateNeighborhoodThoughts(highlightedThought.id);
                }
            });
        }
    }, [highlightedThought]);

    // handle ui changes when highlighted thought changes
    useEffect(() => {

        if (highlightedThought === null) {
            window.history.pushState(null, '', '/graph');
            // setStageSize(_ => ({ width: window.innerWidth, height: window.innerHeight - 60 }));
            setOverlayVisible(false);
            return;
        }
        if (temporalThoughts.length === 0)
            return;
        window.history.pushState(null, '', `/graph/${highlightedThought.id}`);

        setOverlayVisible(true);
        if (scrollContainer.current) {
            scrollContainer.current.scrollTop = 0;
        }
    }, [highlightedThought]);

    // zooming effect
    useEffect(() => {
        setZoomingControl(zoomingHeld);
    }, [zoomingHeld]);

    const handleUserProfileClick = (username: string) => {
        window.history.pushState(null, '', `/user/${username}`);

        fetchUserProfile(username).then(response => {
            if (response.ok) {
                // setProfileUser(response.data!);
                const temporalThoughts = mapDtosToRenderedThoughts(response.data!.thoughts);
                setTemporalThoughts(temporalThoughts);
                clearNeighborhoodThoughts();
                setTimeShift(0);
                setBeginningThoughtId(temporalThoughts[0].id);
            }
        });
    }

    return (
        <>
            {((overlayVisible && fullHighlightedThought !== null) &&
                <div className='overlay'>

                        <ThoughtViewer
                            thought={fullHighlightedThought}
                            landscapeMode={landscapeMode}
                            setHighlightedThoughtId={setHighlightedThoughtId}
                            closePreview={unsetHighlightedThought}
                            clickedOnUser={username => handleUserProfileClick(username)}
                            neighborhoodThoughts={neighborhoodThoughts}>
                        </ThoughtViewer>
                </div>
            )}

            {/* The visibility: collapse (instead of hidden) here is to not start the graph in the initial position each time its opened again */}
            <div className='graph-bottom-part'>
                <div className='stage-container'>
                    <Stage className='graph-stage' width={initialStageSize.width} height={initialStageSize.height} options={{ backgroundColor: COLOR_BACKGROUND, antialias: true }}>
                        <GraphContainer initialHighlightedThoughtId={initialHighlightedThoughtId}></GraphContainer>
                    </Stage>

                    <GraphControls>
                        
                    </GraphControls>

                    {/* {(newestDate
                        && (<div className='time-shift-label'>{newestDate}</div>)
                        || <div className='time-shift-label'>0</div>)}

                    <button className='graph-ui-button rewind-button'
                        onPointerDown={_ => setTimeShiftControl(1)} onPointerUp={_ => setTimeShiftControl(0)} onPointerLeave={_ => setTimeShiftControl(0)} onPointerOut={_ => setTimeShiftControl(0)}>
                        {timeShiftControl != 1 && <img draggable='false' src={PUBLIC_FOLDER + '/icons/rewind.svg'}></img>}
                    </button>

                    <button className='graph-ui-button play-forward-button'
                        onPointerDown={_ => setTimeShiftControl(-1)} onPointerUp={_ => setTimeShiftControl(0)} onPointerLeave={_ => setTimeShiftControl(0)} onPointerOut={_ => setTimeShiftControl(0)}>
                        {timeShiftControl != -1 && <img draggable='false' src={PUBLIC_FOLDER + '/icons/play-forward.svg'}></img>}
                    </button> */}
                    <button className='graph-ui-button zoom-in-button'
                        onPointerDown={_ => setZoomingHeld(1)} onPointerUp={_ => setZoomingHeld(_ => 0)} onPointerLeave={_ => setZoomingHeld(0)} onPointerOut={_ => setZoomingHeld(0)}>
                        {zoomingHeld != 1 && <img draggable='false'
                            src={PUBLIC_FOLDER + '/icons/zoom-in.svg'}></img>}
                    </button>

                    <button className='graph-ui-button zoom-out-button'
                        onPointerDown={_ => setZoomingHeld(-1)} onPointerUp={_ => setZoomingHeld(0)} onPointerLeave={_ => setZoomingHeld(0)} onPointerOut={_ => setZoomingHeld(0)}>
                        {zoomingHeld != -1 && <img draggable='false'
                            src={PUBLIC_FOLDER + '/icons/zoom-out.svg'}></img>}
                    </button>
                </div>
                {/* <Link to='/create-thought' className='button-primary center link-button'>{Localization.NewThought}</Link> */}
            </div>
        </>
    );

};

export default GraphPage;