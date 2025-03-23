import { create } from 'zustand';
import { Viewport } from '../model/Viewport';
import { RenderedThought } from '../model/renderedThought';
import { MAX_THOUGHTS_ON_SCREEN_FOR_LOGGED_OUT } from './graphParameters';
import { userSettingsDto } from '../../../api/dto/UserSettingsDto';

interface GraphStore {

    // Temporal thoughts are thoughts viewed using time slider
    temporalRenderedThoughts: RenderedThought[];
    setTemporalRenderedThoughts: (thoughts: RenderedThought[]) => void;

    // The first thought in temporal array beyond which it is useless to fetch more data
    beginningThoughtId: number | null;
    setBeginningThoughtId: (id: number) => void;
    // The last thought  in temporal array beyond which client enters live-preview mode (set at graph initialization as the last existing thought at the time of initialization)
    endingThoughtId: number | null;
    setEndingThoughtId: (id: number) => void;

    //Flag to indicate whether the app is fetching temporal thoughts from API (to prevent from multiple calls)
    fetchingTemporalThoughts: boolean;
    setFetchingTemporalThoughts: (value: boolean) => void;


    // Neighborhood thoughts are thoughts that are in the neighborhood of the highlighted thought
    neighborhoodThoughts: RenderedThought[];
    setNeighborhoodThoughts: (thoughts: RenderedThought[]) => void;

    // Thoughts that are fading out
    fadeOutThoughts: RenderedThought[];
    setFadeOutThoughts: (thoughts: RenderedThought[]) => void;


    viewport: Viewport;
    setViewport: (viewport: Viewport) => void;
    lockedOnHighlighted: boolean;
    setLockedOnHighlighted: (val: boolean) => void;

    zoomingControl: number;
    setZoomingControl: (value: number) => void;

    highlightedThought: RenderedThought | null;
    // this is used for graph walk  and initial highlight on page load - the function expects the thought with the id be present in either neighborhood thoughts or temporal thoughts
    setHighlightedThoughtById: (id: number) => void;
    setHighlightedThought: (thought: RenderedThought) => void;
    unsetHighlightedThought: () => void;

    frame: number;
    setFrame: (frame: number) => void;

    timeShiftControl: number;
    setTimeShiftControl: (timeShift: number) => void;

    timeShift: number;
    setTimeShift: (timeShift: number) => void;

    userSettings: userSettingsDto;
    setUserSettings: (settings: userSettingsDto) => void;
}
export const useGraphStore = create<GraphStore>((set, get) => ({
    temporalRenderedThoughts: [],
    setTemporalRenderedThoughts: (thoughts: RenderedThought[]) => {
        set({ temporalRenderedThoughts: thoughts });
    },

    fetchingTemporalThoughts: false,
    setFetchingTemporalThoughts: (value: boolean) => set({ fetchingTemporalThoughts: value }),

    neighborhoodThoughts: [],
    setNeighborhoodThoughts: (thoughts: RenderedThought[]) => set({ neighborhoodThoughts: thoughts }),

    fadeOutThoughts: [],
    setFadeOutThoughts: (thoughts: RenderedThought[]) => set({ fadeOutThoughts: thoughts }),

    beginningThoughtId: null,
    setBeginningThoughtId: (id: number) => set({ beginningThoughtId: id }),
    endingThoughtId: null,
    setEndingThoughtId: (id: number) => set({ endingThoughtId: id }),

    viewport: new Viewport(0, 0),
    setViewport: (viewport: Viewport) => set({ viewport }),
    lockedOnHighlighted: false,
    setLockedOnHighlighted: (val: boolean) => set({ lockedOnHighlighted: val }),

    zoomingControl: 0,
    setZoomingControl: (value: number) => set({ zoomingControl: value }),

    highlightedThought: null,
    setHighlightedThoughtById: (id) => {
        const currentlyhighlighted = get().highlightedThought;
        if (currentlyhighlighted !== null)
            currentlyhighlighted.highlighted = false;
        if (id === 0) {
            set({ highlightedThought: null });
            return;
        }


        const newlyHighlightedThought = get().neighborhoodThoughts.find((thought) => thought.id === id)
            ?? get().temporalRenderedThoughts.find((thought) => thought.id === id);

        set({ highlightedThought: newlyHighlightedThought || null });
        if (newlyHighlightedThought !== null && newlyHighlightedThought !== undefined) {
            newlyHighlightedThought.highlighted = true;
            set({ lockedOnHighlighted: true });

            //handle time shift on highlight
            const allRenderedThoughts = get().temporalRenderedThoughts;
            const newUnboundedTimeShift = allRenderedThoughts.length - 1 - allRenderedThoughts.indexOf(newlyHighlightedThought) - Math.floor(get().userSettings.maxThoughts / 2);
            const newTimeshift = newUnboundedTimeShift < 0
                ? 0
                : newUnboundedTimeShift > get().temporalRenderedThoughts.length - get().userSettings.maxThoughts
                    ? get().temporalRenderedThoughts.length - get().userSettings.maxThoughts
                    : newUnboundedTimeShift;
            set({ timeShift: newTimeshift });
        }
    },
    setHighlightedThought: (thought: RenderedThought) => {
        const currentlyhighlighted = get().highlightedThought;
        if (currentlyhighlighted !== null)
            currentlyhighlighted.highlighted = false;

        // //handle time shift on highlight
        // const temporalRenderedThoughts = get().temporalRenderedThoughts;
        // const newUnboundedTimeShift = temporalRenderedThoughts.length - 1 - temporalRenderedThoughts.indexOf(thought) - Math.floor(get().maxThoughtsOnScreen / 2);
        // const newTimeshift = newUnboundedTimeShift < 0
        //     ? 0
        //     : newUnboundedTimeShift > get().temporalRenderedThoughts.length - get().maxThoughtsOnScreen
        //         ? get().temporalRenderedThoughts.length - get().maxThoughtsOnScreen
        //         : newUnboundedTimeShift;
        // set({ timeShift: newTimeshift });

        set({ highlightedThought: thought });
        set({ lockedOnHighlighted: true });
        thought.highlighted = true;
    },
    unsetHighlightedThought: () => {
        const currentlyhighlighted = get().highlightedThought;
        if (currentlyhighlighted !== null)
            currentlyhighlighted.highlighted = false;
        set({ highlightedThought: null });
        set({ lockedOnHighlighted: false });
    },

    frame: 0,
    setFrame: (frame) => set({ frame }),

    timeShiftControl: 0,
    setTimeShiftControl: (timeShiftControl) => set({ timeShiftControl }),
    timeShift: 0,
    setTimeShift: (timeShift) => set({ timeShift }),

    userSettings: { color: "#ffffff", maxThoughts: MAX_THOUGHTS_ON_SCREEN_FOR_LOGGED_OUT, username: "not logged in" },
    //todo - localization?
    setUserSettings: (settings) => set({ userSettings: settings }),
}));