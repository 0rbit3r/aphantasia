import { fetchConcept } from "../../../api/ConceptApi";
import { fetchUserProfile } from "../../../api/userProfileApiClient";
import { RenderedThought } from "../model/renderedThought";
import { useGraphControlsStore as useControlsStore } from "../state_and_parameters/GraphControlsStore";
import { MAX_THOUGHTS_ON_SCREEN_FOR_LOGGED_OUT, NEW_NODE_FADE_IN_FRAMES, NEW_NODE_INVISIBLE_FOR } from "../state_and_parameters/graphParameters";
import { useGraphStore } from "../state_and_parameters/GraphStore";
import { getThoughtsOnScreen, initializeConceptThoughts, mapDtosToRenderedThoughts } from "./thoughtsProvider";

export enum ExplorationMode {
    NEIGHBORHOOD = 'neighborhood',
    TEMPORAL = 'temporal',
    PROFILE = 'profile',
    FREE = 'free',
    CONCEPT = 'concept'
}

// could accept site url in "~User/_concept_example" format
// now it can be username, concept tag

export const MM_SwitchToExplorationMode = (newMode: ExplorationMode, info: string) => {
    const controlsState = useControlsStore.getState();
    const graphState = useGraphStore.getState();

    const oldThoughtsOnScreen = getThoughtsOnScreen();

    if (newMode === ExplorationMode.PROFILE) {
        // Switch to neighborhood mode
        // console.log('Switching to profile mode');

        fetchUserProfile(info).then(response => {
            if (response.ok) {
                // console.log("Fetched profile: ", response.data);
                graphState.setViewedProfile(response.data!);
                // setProfileUser(response.data!);
                const temporalThoughts = mapDtosToRenderedThoughts(response.data!.thoughts);
                let lastUserThoughtId = -1;
                for (let i = 0; i < temporalThoughts.length; i++) {
                    if (temporalThoughts[i].author === response.data!.username) {
                        // if (lastUserThoughtId !== -1 && !temporalThoughts[i].links.includes(lastUserThoughtId)) {
                        //     temporalThoughts[i].virtualLinks.push(lastUserThoughtId);
                        // }
                        lastUserThoughtId = temporalThoughts[i].id;
                    }
                }

                //set the timeshift
                graphState.setTemporalRenderedThoughts(temporalThoughts);
                graphState.setBeginningThoughtId(temporalThoughts[0].id);

                if (graphState.highlightedThought?.id !== undefined) {
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
                }
                else {
                    graphState.setTimeShift(0);
                }

                graphState.unsetHighlightedThought();
                graphState.setNeighborhoodThoughts([]);
            }

        });
    }
    else {
        graphState.clearViewedProfile();
    }

    if (newMode === ExplorationMode.CONCEPT) {
        graphState.setTimeShift(0);

        fetchConcept(info).then(response => {
            if (response.ok) {
                graphState.setViewedConcept(response.data!);
                initializeConceptThoughts(graphState.highlightedThought?.id || null, info).then(_ => {
                    handleFadeInAndReturnFadeOut(oldThoughtsOnScreen);
                });
                graphState.unsetHighlightedThought();
            }
        });
    } else {
        graphState.clearViewedConcept();
    }

    if (newMode === ExplorationMode.NEIGHBORHOOD) {
        if (graphState.timeShift < 0) {
            graphState.setTimeShift(0);
        }
    }

    controlsState.setExplorationMode(newMode);
};

const handleFadeInAndReturnFadeOut = (oldThoughtsOnScreen: RenderedThought[]) => {
    // handle smooth transition between the two modes (fade in and out)
    const newThoughtsOnScreen = getThoughtsOnScreen();
    const thoughtsToFadeAway = oldThoughtsOnScreen.filter(thought => !newThoughtsOnScreen.includes(thought));
    thoughtsToFadeAway.forEach(thought => {
        thought.timeOnScreen = NEW_NODE_INVISIBLE_FOR + NEW_NODE_FADE_IN_FRAMES / 3;
    });

    const thoughtsToFadeIn = newThoughtsOnScreen.filter(thought => !oldThoughtsOnScreen.includes(thought));
    // THIS SHOULD HAPPEN AUTOMATICALLY IN DTO->RENDEREDTHOUGHT MAPPER, NO?
    // Not really - this is not fetching or mapping any new thoughts.
    thoughtsToFadeIn.forEach(thought => {
        thought.timeOnScreen = 0;
    });

    console.log('old thoughts on screen: ', oldThoughtsOnScreen);
    console.log("thoughts on screen: ", newThoughtsOnScreen);
    console.log("fade out thoughts: ", thoughtsToFadeAway);
    console.log("fade in thoughts: ", thoughtsToFadeIn);

    useGraphStore.getState().setFadeOutThoughts(thoughtsToFadeAway);
}

// this is used for graph walk  and initial highlight on page load
// - the function expects the thought with the id be present in either neighborhood thoughts or temporal thoughts
export const MM_SetHighlightedThoughtById: (id: number) => void = (id: number) => {
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

export const MM_InitializeGraphMode = (_: ExplorationMode) => {
    const graphState = useGraphStore.getState();

    graphState.clearViewedProfile();
    graphState.unsetHighlightedThought();
    graphState.setNeighborhoodThoughts([]);

}