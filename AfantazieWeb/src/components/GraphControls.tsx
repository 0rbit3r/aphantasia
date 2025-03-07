import { ChangeEvent, useEffect, useState } from "react";
import { useGraphControlsStore } from "../pages/graph/state_and_parameters/GraphControlsStore";
import { useGraphStore } from "../pages/graph/state_and_parameters/GraphStore";
import { Localization } from "../locales/localization";
import { clearNeighborhoodThoughts, getThoughtsInTimeWindow } from "../pages/graph/simulation/thoughtsProvider";


const PUBLIC_FOLDER = import.meta.env.VITE_PUBLIC_FOLDER;

interface GraphControlsProps {

}

const GraphControls = () => {

    // graph settings controls
    const setAnimatedEdgesEnabled = useGraphControlsStore(state => state.setAnimatedEdgesEnabled);

    // UI control states
    const [settingsWindowVisible, setSettingsWindowVisible] = useState(false);
    const [temporalControlsVisible, setTemporalControlsVisible] = useState(false);

    const [rewindMode, setRewindMode] = useState('pause');

    // graph state
    const setTimeShiftControl = useGraphStore(state => state.setTimeShiftControl);
    const setTimeShift = useGraphStore(state => state.setTimeShift);
    const timeShift = useGraphStore((state) => state.timeShift);
    const [newestDate, setNewestDate] = useState<string>('-');

    const handleModeChanged = (mode: string) => {
        if (mode === 'settings') {
            if (settingsWindowVisible) {
                setSettingsWindowVisible(false);
            }
            else {
                setRewindMode('pause');
                setTemporalControlsVisible(false);
                setSettingsWindowVisible(true);
            }
        }
        else if (mode === 'temporal') {
            if (temporalControlsVisible) {
                setRewindMode('pause');
                setTemporalControlsVisible(false);
            }
            else {
                setTemporalControlsVisible(true);
                setSettingsWindowVisible(false);
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
            setTimeShiftControl(0);
            setTimeShift(-1);
        }
    }, [rewindMode]);



    useEffect(() => {
        const thoughtsInTimeWindow = getThoughtsInTimeWindow();
        // console.log("visibleThoughts: ", thoughtsInTimeWindow)

        if (thoughtsInTimeWindow && thoughtsInTimeWindow.length > 0 && thoughtsInTimeWindow[thoughtsInTimeWindow.length - 1].dateCreated) {
            // console.log("allRenderedThoughts: ", temporalThoughts)
            if (timeShift > 0) {
                setNewestDate(thoughtsInTimeWindow[thoughtsInTimeWindow.length - 1].dateCreated || "...");
            }
            else {
                setNewestDate(Localization.RightNow);
            }
        }
    }, [timeShift]);

    function animatedEdgesCheckboxChanged(e: ChangeEvent<HTMLInputElement>): void {
        setAnimatedEdgesEnabled(e.target.checked);
    }

    return (
        <div className="graph-controls">
            <div className={`settings-window ${!settingsWindowVisible ? "settings-window-collapsed" : ""}`}>
                <div className="settings-window-top-bar"><button onClick={() => setSettingsWindowVisible(false)}>X</button></div>
                <label>
                    <input className="settings-window-checkbox" type="checkbox" onChange={e => animatedEdgesCheckboxChanged(e)}></input>
                    Animated edges
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
                    onClick={() => handleModeChanged('temporal')}>
                    {temporalControlsVisible
                        ? <img src={PUBLIC_FOLDER + "/icons/rewind_black.svg"}></img>
                        : <img src={PUBLIC_FOLDER + "/icons/rewind_white.svg"}></img>
                    }
                </button>
                <button className='graph-controls-button'>
                    <img src={PUBLIC_FOLDER + "/icons/neighborhood_white.svg"}></img>
                </button>
                <button className='graph-controls-button'>
                    <img src={PUBLIC_FOLDER + "/icons/filter_white.svg"}></img>
                </button>
                <button className={`graph-controls-button ${settingsWindowVisible ? 'graph-controls-button-active' : ''}`}
                    onClick={() => handleModeChanged('settings')}>
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