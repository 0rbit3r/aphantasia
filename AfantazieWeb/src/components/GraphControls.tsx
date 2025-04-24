import { ChangeEvent, useEffect, useState } from "react";
import { EdgeType, useGraphControlsStore } from "../pages/graph/state_and_parameters/GraphControlsStore";
import { useGraphStore } from "../pages/graph/state_and_parameters/GraphStore";
import { Localization } from "../locales/localization";
import { clearNeighborhoodThoughts, getThoughtsInTimeWindow, initializeTemporalThoughts } from "../pages/graph/simulation/thoughtsProvider";
import { GraphControlsCache } from "../pages/graph/model/GraphControlsCache";
import { ExplorationMode, MM_InitializeGraphMode, MM_SwitchToExplorationMode } from "../pages/graph/simulation/modesManager";
import { BASE_RADIUS, DEFAULT_MAX_RADIUS, MAX_THOUGHTS_ON_SCREEN_FOR_LOGGED_OUT as DEFAULT_MAX_THOUGHTS_ON_SCREEN, REFERENCE_RADIUS_MULTIPLIER} from "../pages/graph/state_and_parameters/graphParameters";


const PUBLIC_FOLDER = import.meta.env.VITE_PUBLIC_FOLDER;

// interface GraphControlsProps {

// }

const GraphControls = () => {

    // graph settings controls
    const gravityEnabled = useGraphControlsStore(state => state.gravityEnabled);
    const setGravityEnabled = useGraphControlsStore(state => state.setGravityEnabled);
    const edgeType = useGraphControlsStore(state => state.edgeType);
    const setEdgeType = useGraphControlsStore(state => state.setEdgeType);
    const noBordersEnabled = useGraphControlsStore(state => state.noBorders);
    const setNoBorders = useGraphControlsStore(state => state.setNoBorders);
    const upFlowEnabled = useGraphControlsStore(state => state.upFlowEnabled);
    const setUpFlowEnabled = useGraphControlsStore(state => state.setUpFlowEnabled);
    const titleOnHoverEnabled = useGraphControlsStore(state => state.titleOnHoverEnabled);
    const setTitleOnHoverEnabled = useGraphControlsStore(state => state.setTitleOnHoverEnabled);
    const showFpsEnabled = useGraphControlsStore(state => state.showFpsEnabled);
    const setFpsEnabled = useGraphControlsStore(state => state.setShowFpsEnabled);
    const disableSimulation = useGraphControlsStore(state => state.disableSimulation);
    const setDisableSimulation = useGraphControlsStore(state => state.setDisableSimulation);
    const thoughtsOnScreenLimit = useGraphControlsStore(state => state.thoughtsOnScreenLimit);
    const setThoughtsOnScreenLimit = useGraphControlsStore(state => state.setThoughtsOnScreenLimit);
    const titleVisibilityThresholdMultiplier = useGraphControlsStore(state => state.titleVisibilityThresholdMultiplier);
    const setVisibilityThresholdMultiplier = useGraphControlsStore(state => state.setTitleVisibilityThresholdMultiplier);
    const edgeLengthMultiplier = useGraphControlsStore(state => state.edgeLengthMultiplier);
    const setEdgeLengthMultiplier = useGraphControlsStore(state => state.setEdgeLengthMultiplier);
    const maxRadius = useGraphControlsStore(state => state.maxRadius);
    const setMaxRadius = useGraphControlsStore(state => state.setMaxRadius);
    const disableFollowHighlightedThought = useGraphControlsStore(state => state.disableFollowHighlightedThought);
    const setDisableFollowHighlightedThought = useGraphControlsStore(state => state.setDisableFollowHighlightedThought);

    const setTemporalThoughts = useGraphStore(state => state.setTemporalRenderedThoughts);

    const explorationMode = useGraphControlsStore(state => state.explorationMode);

    const setFrame = useGraphStore(state => state.setFrame);
    // UI control states
    const [settingsWindowVisible, setSettingsWindowVisible] = useState(false);
    const [temporalControlsVisible, setTemporalControlsVisible] = useState(false);
    const [newestDate, setNewestDate] = useState<string>('-');

    const [rewindMode, setRewindMode] = useState('pause');

    // graph state
    const setTimeShiftControl = useGraphStore(state => state.setTimeShiftControl);
    const setTimeShift = useGraphStore(state => state.setTimeShift);
    const timeShift = useGraphStore((state) => state.timeShift);

    const handleResetDefaults = () => {
        setEdgeType(EdgeType.ARRROW);
        setGravityEnabled(false);
        setTitleOnHoverEnabled(false);
        setUpFlowEnabled(false);
        setNoBorders(false);
        setFpsEnabled(false);
        setDisableSimulation(false);
        setThoughtsOnScreenLimit(DEFAULT_MAX_THOUGHTS_ON_SCREEN);
        setVisibilityThresholdMultiplier(1.0);
        setEdgeLengthMultiplier(1.0);
        handleSetMaxRadius(DEFAULT_MAX_RADIUS);
    }

    const handleMainButtonPress = (button: string) => {
        if (button === 'settings') {
            if (settingsWindowVisible) {
                setSettingsWindowVisible(false);
            }
            else {
                setRewindMode('pause');
                setTemporalControlsVisible(false);
                setSettingsWindowVisible(true);
            }
        }
        else if (button === 'temporal') {
            if (temporalControlsVisible) {
                setRewindMode('pause');
                setTemporalControlsVisible(false);
            }
            else {
                setTemporalControlsVisible(true);
                setSettingsWindowVisible(false);
                if (explorationMode === ExplorationMode.NEIGHBORHOOD) {
                    setRewindMode('pause');
                    MM_SwitchToExplorationMode(ExplorationMode.TEMPORAL, '');
                }
            }
        }
        else if (button === 'neighborhood') {
            if (explorationMode !== ExplorationMode.NEIGHBORHOOD) {
                setRewindMode('pause');
                setTemporalControlsVisible(false);
                MM_SwitchToExplorationMode(ExplorationMode.NEIGHBORHOOD, '');
            }
            else {
                MM_SwitchToExplorationMode(ExplorationMode.TEMPORAL, '');
            }
        }
    }

    useEffect(() => {
        if (rewindMode === 'backward') {
            clearNeighborhoodThoughts();
            setTimeShiftControl(1);
        }
        else if (rewindMode === 'forward') {
            setTimeShiftControl(-1);
            clearNeighborhoodThoughts();
        }
        else if (rewindMode === 'pause') {
            setTimeShiftControl(0);
        }
        else if (rewindMode === 'live') {
            // setFetchingTemporalThoughts(true);
            // // this did not work -> in thoughtsprovider.handleTemporalThoughtsTimeShifting the fetching is set to false which triggers
            // timewindow sliding handling and I dont know why... -> TODO
            setTemporalThoughts([]); //this needs to be here

            MM_InitializeGraphMode(ExplorationMode.TEMPORAL);
            initializeTemporalThoughts(null);

            setTimeShiftControl(0);
            setTimeShift(-1);
            window.history.pushState(null, '', '/graph/now');
        }
    }, [rewindMode]);

    useEffect(() => {
        const storage = localStorage.getItem('settings-cache'); //todo use set?
        const cachedSettings: GraphControlsCache = storage ? JSON.parse(storage) : [];

        // console.log("cachedSettings: ", cachedSettings);
        if (cachedSettings) {
            if (cachedSettings.edgeType !== undefined)
                setEdgeType(cachedSettings.edgeType);
            if (cachedSettings.gravityEnabled !== undefined)
                setGravityEnabled(cachedSettings.gravityEnabled);
            if (cachedSettings.titleOnHoverEnabled !== undefined)
                setTitleOnHoverEnabled(cachedSettings.titleOnHoverEnabled);
            if (cachedSettings.upFlowEnabled !== undefined)
                setUpFlowEnabled(cachedSettings.upFlowEnabled);
            if (cachedSettings.noBorders !== undefined)
                setNoBorders(cachedSettings.noBorders);
            if (cachedSettings.showFpsEnabled !== undefined)
                setFpsEnabled(cachedSettings.showFpsEnabled);
            if (cachedSettings.disableSimulation !== undefined)
                setDisableSimulation(cachedSettings.disableSimulation);
            if (cachedSettings.ThoughtsOnScreenLimit !== undefined)
                setThoughtsOnScreenLimit(cachedSettings.ThoughtsOnScreenLimit);
            if (cachedSettings.titleVisibilityThresholdMultiplier !== undefined)
                setVisibilityThresholdMultiplier(cachedSettings.titleVisibilityThresholdMultiplier);
            if (cachedSettings.edgeLengthMultiplier !== undefined)
                setEdgeLengthMultiplier(cachedSettings.edgeLengthMultiplier);
            if (cachedSettings.maxRadius !== undefined)
                setMaxRadius(cachedSettings.maxRadius);
        }
    }, []);

    useEffect(() => {
        setRewindMode('pause');
        setTimeShiftControl(0);
    }, [explorationMode]);

    // update saved settings
    useEffect(() => {
        const settings: GraphControlsCache = {
            edgeType: edgeType,
            gravityEnabled: gravityEnabled,
            titleOnHoverEnabled: titleOnHoverEnabled,
            upFlowEnabled: upFlowEnabled,
            noBorders: noBordersEnabled,
            showFpsEnabled: showFpsEnabled,
            disableSimulation: disableSimulation,
            ThoughtsOnScreenLimit: thoughtsOnScreenLimit,
            titleVisibilityThresholdMultiplier: titleVisibilityThresholdMultiplier,
            edgeLengthMultiplier: edgeLengthMultiplier,
            maxRadius: maxRadius,
        };
        localStorage.setItem('settings-cache', JSON.stringify(settings));
    }, [edgeType, gravityEnabled, upFlowEnabled,
        noBordersEnabled, titleOnHoverEnabled,
        showFpsEnabled, disableSimulation, thoughtsOnScreenLimit,
        titleVisibilityThresholdMultiplier, edgeLengthMultiplier,
        maxRadius]);

    // reset simulation frame
    useEffect(() => {
        setFrame(0);
    }, [gravityEnabled, upFlowEnabled, noBordersEnabled, temporalControlsVisible,
        disableSimulation, thoughtsOnScreenLimit, edgeLengthMultiplier]);

    // update date label on change of timeShift or exploration mode etc.
    useEffect(() => {
        const thoughtsInTimeWindow = getThoughtsInTimeWindow();
        // console.log("time shift changed to: ", timeShift);

        if (thoughtsInTimeWindow && thoughtsInTimeWindow.length > 0 && thoughtsInTimeWindow[thoughtsInTimeWindow.length - 1].dateCreated) {

            // todo - this is not hit when date is clicked -> find a way to update the date when explor. mode is changed

            if (timeShift >= 0) {
                setNewestDate(thoughtsInTimeWindow[thoughtsInTimeWindow.length - 1].dateCreated || "...");
            }
            else{
            setNewestDate(Localization.RightNow);
            }
        }
        else if (timeShift < 0) {
            setNewestDate(Localization.RightNow);
        }
        
    }, [timeShift, explorationMode, temporalControlsVisible]);

    function gravityCheckboxChanged(e: ChangeEvent<HTMLInputElement>): void {
        setGravityEnabled(e.target.checked);
    }

    const handleSetMaxRadius = (value: number) => {
        setMaxRadius(value);
        setFrame(0);
        const graphState = useGraphStore.getState();
        graphState.neighborhoodThoughts.forEach(
            t => t.radius = Math.min(
                BASE_RADIUS * Math.pow(REFERENCE_RADIUS_MULTIPLIER, t.size),
                value));
        graphState.temporalRenderedThoughts.forEach(
            t => t.radius = Math.min(
                BASE_RADIUS * Math.pow(REFERENCE_RADIUS_MULTIPLIER, t.size),
                value));
    };

    return (
        <div className="graph-controls">
            <div className={`settings-window ${!settingsWindowVisible ? "settings-window-collapsed" : ""}`}>
                <div className="settings-window-top-bar">
                    <button className="settings-window-reset-default-button" onClick={() => handleResetDefaults()}>
                        {Localization.ResetDefaults}
                    </button>
                    <button className="settings-window-close-button" onClick={() => setSettingsWindowVisible(false)}>X</button>
                </div>
                <label>
                    {Localization.SizeLabel}&nbsp;&nbsp;
                    <select className="settings-window-select" onChange={e => setThoughtsOnScreenLimit(parseInt(e.target.value))} value={thoughtsOnScreenLimit}>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                        <option value={150}>150</option>
                        <option value={200}>200</option>
                        <option value={350}>350</option>
                        <option value={500}>500</option>
                        <option value={1000}>1000</option>
                        <option value={2000}>2000</option>
                    </select>
                </label>
                <br />
                <label>
                    {Localization.EdgesLabel}&nbsp;
                    <select className="settings-window-select" onChange={e => setEdgeType(parseInt(e.target.value))} value={edgeType}>
                        <option value={0}>{Localization.EdgesNone}</option>
                        <option value={1}>{Localization.EdgesSimple}</option>
                        <option value={2}>{Localization.EdgesArrow}</option>
                        <option value={3}>{Localization.EdgesAnimated}</option>
                        <option value={4}>{Localization.EdgesGradient}</option>
                    </select>
                </label>
                <br />
                <label>{Localization.TitlesThresholdLabel}</label>
                <br />
                <input className="settings-window-range" type="range" min={0.4} max={2} step={0.1} value={titleVisibilityThresholdMultiplier}
                    onChange={e => setVisibilityThresholdMultiplier(parseFloat(e.target.value))}></input>
                <br />
                <label>{Localization.EdgesLengthLabel}</label>
                <br />
                <input className="settings-window-range" type="range" min={0.6} max={4} step={0.2} value={edgeLengthMultiplier}
                    onChange={e => setEdgeLengthMultiplier(parseFloat(e.target.value))}></input>
                <br />
                <label>{Localization.NodeSizeLabel}</label>
                <br />
                <input className="settings-window-range" type="range" min={1000} max={8000} step={500} value={maxRadius}
                    onChange={e => handleSetMaxRadius(parseInt(e.target.value))}
                ></input>
                <br />
                <label>
                    <input className="settings-window-checkbox" type="checkbox" onChange={e => gravityCheckboxChanged(e)} checked={gravityEnabled}></input>
                    {Localization.GravityLabel}
                </label>
                <br />
                <label>
                    <input className="settings-window-checkbox" type="checkbox" onChange={e => setTitleOnHoverEnabled(e.target.checked)} checked={titleOnHoverEnabled}></input>
                    {Localization.TitleOnHoverLabel}
                </label>
                <br />
                <label>
                    <input className="settings-window-checkbox" type="checkbox" onChange={e => setUpFlowEnabled(e.target.checked)} checked={upFlowEnabled}></input>
                    {Localization.UpFlowLabel}
                </label>
                <br />
                <label>
                    <input className="settings-window-checkbox" type="checkbox" onChange={e => setFpsEnabled(e.target.checked)} checked={showFpsEnabled}></input>
                    {Localization.ShowFPSLabel}
                </label>
                <br />
                <label>
                    <input className="settings-window-checkbox" type="checkbox" onChange={e => setNoBorders(e.target.checked)} checked={noBordersEnabled}></input>
                    {Localization.NoBordersLabel}
                </label>
                <br />
                <label>
                    <input className="settings-window-checkbox" type="checkbox" onChange={e => setDisableSimulation(e.target.checked)} checked={disableSimulation}></input>
                    {Localization.DisableSimulationLabel}
                </label>
                <br />
                <label>
                    <input className="settings-window-checkbox" type="checkbox" onChange={e => setDisableFollowHighlightedThought(e.target.checked)}
                    checked={disableFollowHighlightedThought}></input>
                    {Localization.DisableFollowHighlighted}
                    </label>
            </div>

            <div className={`temporal-section ${!temporalControlsVisible ? "settings-window-collapsed" : ""}`}>

                {(newestDate
                    && (<div className='time-shift-label'>{newestDate}</div>)
                    || <div className='time-shift-label'>---</div>)}
                <div className={`temporal-controls`}>
                    <button className={`temporal-controls-button ${rewindMode === 'backward' ? 'temporal-controls-button-active' : ''}`}
                        onClick={() => setRewindMode('backward')}>
                        {
                            rewindMode === 'backward'
                                ? <img src={PUBLIC_FOLDER + "/icons/backward_black.svg"}></img>
                                : <img src={PUBLIC_FOLDER + "/icons/backward_white.svg"}></img>
                        }
                    </button>
                    <button className={`temporal-controls-button ${rewindMode === 'pause' ? 'temporal-controls-button-active' : ''}`}
                        onClick={() => setRewindMode('pause')}>
                        {
                            rewindMode === 'pause'
                                ? <img src={PUBLIC_FOLDER + "/icons/pause_black.svg"}></img>
                                : <img src={PUBLIC_FOLDER + "/icons/pause_white.svg"}></img>
                        }
                    </button>
                    <button className={`temporal-controls-button ${rewindMode === 'forward' ? 'temporal-controls-button-active' : ''}`}
                        onClick={() => setRewindMode('forward')}>
                        {
                            rewindMode === 'forward'
                                ? <img src={PUBLIC_FOLDER + "/icons/forward_black.svg"}></img>
                                : <img src={PUBLIC_FOLDER + "/icons/forward_white.svg"}></img>
                        }
                    </button>
                    <button className={`temporal-controls-button ${rewindMode === 'live' ? 'temporal-controls-button-active' : ''}`}
                        onClick={() => setRewindMode('live')}>
                        {
                            rewindMode === 'live'
                                ? <img src={PUBLIC_FOLDER + "/icons/record_black.svg"}></img>
                                : <img src={PUBLIC_FOLDER + "/icons/record_white.svg"}></img>
                        }
                    </button>
                </div>
            </div>
            <div className="graph-controls-buttons-row">
                <button className={`graph-controls-button ${temporalControlsVisible ? 'graph-controls-button-active' : ''}`}
                    onClick={() => handleMainButtonPress('temporal')}>
                    {temporalControlsVisible
                        ? <img src={PUBLIC_FOLDER + "/icons/rewind_black.svg"}></img>
                        : <img src={PUBLIC_FOLDER + "/icons/rewind_white.svg"}></img>
                    }
                </button>
                <button className={`graph-controls-button ${explorationMode === ExplorationMode.NEIGHBORHOOD ? 'graph-controls-button-active' : ''}`}
                    onClick={_ => handleMainButtonPress('neighborhood')}>
                    {explorationMode === ExplorationMode.NEIGHBORHOOD
                        ? <img src={PUBLIC_FOLDER + "/icons/neighborhood_black.svg"}></img>
                        : <img src={PUBLIC_FOLDER + "/icons/neighborhood_white.svg"}></img>

                    }
                </button>
                <button className='graph-controls-button'>
                    {/* <img src={PUBLIC_FOLDER + "/icons/filter_white.svg"}></img> */}
                </button>
                <button className={`graph-controls-button ${settingsWindowVisible ? 'graph-controls-button-active' : ''}`}
                    onClick={() => handleMainButtonPress('settings')}>
                    {
                        settingsWindowVisible
                            ? <img src={PUBLIC_FOLDER + "/icons/options_black.svg"}></img>
                            : <img src={PUBLIC_FOLDER + "/icons/options_white.svg"}></img>
                    }
                </button>
            </div>
        </div>
    );
}

export default GraphControls;