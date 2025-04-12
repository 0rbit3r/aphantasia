import { fetchUserProfile } from "../../../api/userProfileApi";
import { useGraphControlsStore as useControlsStore } from "../state_and_parameters/GraphControlsStore";
import { MAX_THOUGHTS_ON_SCREEN_FOR_LOGGED_OUT } from "../state_and_parameters/graphParameters";
import { useGraphStore } from "../state_and_parameters/GraphStore";
import { mapDtosToRenderedThoughts } from "./thoughtsProvider";

export enum ExplorationMode {
    NEIGHBORHOOD = 'neighborhood',
    TEMPORAL = 'temporal',
    PROFILE = 'profile',
    FREE = 'free',
}

// Will accept stte in "~User/#hashtag/example" format

export const SwitchToExplorationMode = (newMode: ExplorationMode, info: string) => {
    const controlsState = useControlsStore.getState();
    const graphState = useGraphStore.getState();

    if (newMode === ExplorationMode.PROFILE) {
        // Switch to neighborhood mode
        console.log('Switching to profile mode');

        const graphState = useGraphStore.getState();

        fetchUserProfile(info).then(response => {
            if (response.ok) {
                console.log("Fetched profile: ", response.data);
                graphState.setViewedProfile(response.data!);
                // setProfileUser(response.data!);
                const temporalThoughts = mapDtosToRenderedThoughts(response.data!.thoughts);
                let lastUserThoughtId = -1;
                for (let i = 0; i < temporalThoughts.length; i++) {
                    if (temporalThoughts[i].author === response.data!.username) {
                        if (lastUserThoughtId !== -1 && !temporalThoughts[i].links.includes(lastUserThoughtId)) {
                            temporalThoughts[i].virtualLinks.push(lastUserThoughtId);
                        }
                        lastUserThoughtId = temporalThoughts[i].id;
                    }
                }

                //set the timeshift
                graphState.setTemporalRenderedThoughts(temporalThoughts);
                graphState.setBeginningThoughtId(temporalThoughts[0].id);

                const indexOfHighlighted = temporalThoughts.findIndex(t => t.id === graphState.highlightedThought?.id);
                const maxThoughtsOnScreen = controlsState.thoughtsOnScreenLimit ?? MAX_THOUGHTS_ON_SCREEN_FOR_LOGGED_OUT;
                const unboundedTimeshift = temporalThoughts.length - 1 - indexOfHighlighted - Math.floor(maxThoughtsOnScreen / 2);

                const boudnedTimeShift = Math.max(0,
                    Math.min(temporalThoughts.length - maxThoughtsOnScreen, unboundedTimeshift));
                // console.log("thoughts in profile: ", temporalThoughts.length);
                // console.log("maxThoughtsOnScreen: ", maxThoughtsOnScreen);
                // console.log("indexOfHighlighted: ", indexOfHighlighted);
                // console.log("unbounded time shift: ", unboundedTimeshift);
                // console.log("boundedTimeShift: ", boudnedTimeShift)
                // console.log("on-screen thoughts: ", getThoughtsOnScreen().length);

                graphState.setTimeShift(boudnedTimeShift);

                graphState.unsetHighlightedThought();
            }

        });
    }
    else{
        graphState.clearViewedProfile();
    }

    controlsState.setExplorationMode(newMode);
};

// this is used for graph walk  and initial highlight on page load
// - the function expects the thought with the id be present in either neighborhood thoughts or temporal thoughts
export const SetHighlightedThoughtById: (id: number) => void = (id: number) => {
    const graphState = useGraphStore.getState();
    const controlsState = useControlsStore.getState();

    const currentlyhighlighted = graphState.highlightedThought;
    if (currentlyhighlighted !== null)
        currentlyhighlighted.highlighted = false;
    if (id === 0) {
        graphState.unsetHighlightedThought();
        return;
    }


    const newlyHighlightedThought = graphState.neighborhoodThoughts.find((thought) => thought.id === id)
        ?? graphState.temporalRenderedThoughts.find((thought) => thought.id === id);

    if (newlyHighlightedThought === undefined) {
        console.warn(`Thought with id ${id} not found in neighborhood or temporal thoughts`);
        return;
    }
    graphState.setHighlightedThought(newlyHighlightedThought);
    if (newlyHighlightedThought !== null && newlyHighlightedThought !== undefined) {
        newlyHighlightedThought.highlighted = true;
        graphState.setLockedOnHighlighted(true);

        //handle time shift on highlight
        const allRenderedThoughts = graphState.temporalRenderedThoughts;
        const newUnboundedTimeShift = allRenderedThoughts.length - 1 - allRenderedThoughts.indexOf(newlyHighlightedThought)
        - Math.floor(controlsState.thoughtsOnScreenLimit / 2);
        const newTimeshift = newUnboundedTimeShift < 0
            ? 0
            : newUnboundedTimeShift > graphState.temporalRenderedThoughts.length - controlsState.thoughtsOnScreenLimit
                ? graphState.temporalRenderedThoughts.length - controlsState.thoughtsOnScreenLimit
                : newUnboundedTimeShift;
        graphState.setTimeShift(newTimeshift);
    }
};