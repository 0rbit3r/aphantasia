import React, { useEffect, useRef, useState } from 'react';
import { Stage } from '@pixi/react';
import { fullThoughtDto } from '../../api/dto/ThoughtDto';
import { useParams } from 'react-router-dom';
import { useGraphStore } from './state_and_parameters/GraphStore';
import GraphContainer from './GraphContainer';
import { fetchTemporalThoughts, fetchThought } from '../../api/graphApiClient';
import { clearNeighborhoodThoughts, initializeTemporalThoughts, updateNeighborhoodThoughts } from './simulation/thoughtsProvider';
import { ThoughtViewer } from '../../components/ThoughtViewer';
import GraphControls from '../../components/GraphControls';
import { useGraphControlsStore } from './state_and_parameters/GraphControlsStore';
import { ExplorationMode, MM_SetHighlightedThoughtById, MM_SwitchToExplorationMode } from './simulation/modesManager';
import { ProfileViewer } from '../../components/ProfileViewer';
import { ConceptViewer } from '../../components/ConceptViewer';

const COLOR_BACKGROUND = 0x000000;

const PUBLIC_FOLDER = import.meta.env.VITE_PUBLIC_FOLDER;

const initialStageSize = { width: window.innerWidth, height: window.innerHeight - 40 };


const GraphPage: React.FC = () => {
    // navigation
    // const navigate = useNavigate();
    const [initialUrlQueryParametr, setUrlQueryParameter] = useState<string | null | undefined>(undefined); //undefined = not yet initialized, null = no parameter (ie. latest)
    const { urlParameter } = useParams();

    // data
    const temporalThoughts = useGraphStore((state) => state.temporalRenderedThoughts);
    const setTemporalThoughts = useGraphStore((state) => state.setTemporalRenderedThoughts);
    const neighborhoodThoughts = useGraphStore((state => state.neighborhoodThoughts));
    const setNeighborhoodThoughts = useGraphStore((state => state.setNeighborhoodThoughts));

    // const [replies, setReplies] = useState<thoughtNodeDto[]>([]);

    // screen state
    const [thoughtViewerVisible, setThoughtViewerVisible] = useState(false);
    // const viewport = useGraphStore((state) => state.viewport);

    // controls
    const [zoomingHeld, setZoomingHeld] = useState(0);
    const setZoomingControl = useGraphStore((state) => state.setZoomingControl);

    const highlightedThought = useGraphStore((state) => state.highlightedThought);
    const unsetHighlightedThought = useGraphStore((state) => state.unsetHighlightedThought);

    const [fullHighlightedThought, setfullHighlightedThought] = useState<fullThoughtDto | null>(null);

    const explorationMode = useGraphControlsStore((state) => state.explorationMode);
    const viewedConcept = useGraphStore((state) => state.viewedConcept);

    // todo - add profile dto to graph Store and use it as param for profile viewer
    const profile = useGraphStore((state) => state.viewedProfile);

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
        if (urlParameter) {
            setUrlQueryParameter(urlParameter);
        }
        else {
            setUrlQueryParameter(null);
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
            // if (explorationMode === ExplorationMode.TEMPORAL) {
            //     window.history.pushState(null, '', '/graph');
            // }
            // setStageSize(_ => ({ width: window.innerWidth, height: window.innerHeight - 60 }));
            setThoughtViewerVisible(false);
            return;
        }
        if (temporalThoughts.length === 0)
            return;
        window.history.pushState(null, '', `/graph/${highlightedThought.id}`);

        setThoughtViewerVisible(true);
        if (scrollContainer.current) {
            scrollContainer.current.scrollTop = 0;
        }
    }, [highlightedThought]);

    // zooming effect
    useEffect(() => {
        setZoomingControl(zoomingHeld);
    }, [zoomingHeld]);

    const handleUserProfileClick = (username: string) => {
        if (profile?.username === username) {
            // console.log("Already viewing this profile")
            unsetHighlightedThought();
            return;
        }

        window.history.pushState(null, '', `/graph/~${username.replace(' ', '_')}`);

        MM_SwitchToExplorationMode(ExplorationMode.PROFILE, username);
    }

    const handleDateClick = () => {
        if (fullHighlightedThought === null) { console.log("dateclicked, but no highlighted thought"); return; }
        initializeTemporalThoughts(fullHighlightedThought.id);
        clearNeighborhoodThoughts();
        MM_SwitchToExplorationMode(ExplorationMode.TEMPORAL, fullHighlightedThought.id.toString());
    }

    return (
        <>
            {((thoughtViewerVisible && fullHighlightedThought !== null) &&
                <div className='overlay'>
                    <ThoughtViewer
                        thought={fullHighlightedThought}
                        previewMode={false}
                        setHighlightedThoughtId={MM_SetHighlightedThoughtById}
                        closePreview={unsetHighlightedThought}
                        clickedOnUser={username => handleUserProfileClick(username)}
                        clickedOnDate={handleDateClick}
                        links={neighborhoodThoughts.filter(t => t.backlinks.includes(fullHighlightedThought.id)).map(t => (
                            { id: t.id, color: t.color, title: t.title }
                        ))}
                        backlinks={neighborhoodThoughts.filter(t => t.links.includes(fullHighlightedThought.id)).map(t => (
                            { id: t.id, color: t.color, title: t.title }
                        ))}
                    >
                    </ThoughtViewer>
                </div>
            )}

            {explorationMode === ExplorationMode.PROFILE && profile !== null && !thoughtViewerVisible &&
                <div className='overlay'>
                    <ProfileViewer
                        profile={profile}
                        closeProfileViewer={function (): void {
                            MM_SwitchToExplorationMode(ExplorationMode.FREE, "");
                        }}>
                    </ProfileViewer>
                </div>
            }

            {explorationMode === ExplorationMode.CONCEPT && viewedConcept !== null && !thoughtViewerVisible &&
                <div className='overlay'>
                    <ConceptViewer
                        concept={viewedConcept}
                        closeConceptViewer={function (): void {
                            MM_SwitchToExplorationMode(ExplorationMode.FREE, "");}}>
                        
                    </ConceptViewer>
                </div>
            }

            {/* The visibility: collapse (instead of hidden) here is to not start the graph in the initial position each time its opened again */}
            <div className='graph-bottom-part'>
                <div className='stage-container'>
                    <Stage className='graph-stage' width={initialStageSize.width} height={initialStageSize.height} options={{ backgroundColor: COLOR_BACKGROUND, antialias: true }}>
                        <GraphContainer pageUrlQueryParameter={initialUrlQueryParametr}></GraphContainer>
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