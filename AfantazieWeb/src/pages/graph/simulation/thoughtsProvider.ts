import { thoughtNodeDto } from "../../../api/dto/ThoughtDto";
import { fetchNeighborhoodThoughts, fetchTemporalThoughts } from "../../../api/graphApiClient";
import { useGraphStore } from "../state_and_parameters/GraphStore";
import { BASE_RADIUS, INITIAL_POSITIONS_RADIUS, MAX_THOUGHTS_ON_SCREEN_FOR_LOGGED_OUT, NEIGHBORHOOD_DEPTH as MAX_DEPTH, NEW_NODE_INVISIBLE_FOR, REFERENCE_RADIUS_MULTIPLIER, SIM_HEIGHT, SIM_WIDTH } from "../state_and_parameters/graphParameters";
import { RenderedThought } from "../model/renderedThought";
import { ThoughtPositionCache } from "../model/thoughtPositionCache";
import { useGraphControlsStore } from "../state_and_parameters/GraphControlsStore";
import { ExplorationMode, MM_SetHighlightedThoughtById } from "./modesManager";

// selects and returns thoughts to render and animate or consider highlighting in graph walk
export function getThoughtsOnScreen() {
  const state = useGraphStore.getState();
  const controlsState = useGraphControlsStore.getState();

  const thoughtsInTimeWindow = getThoughtsInTimeWindow();

  switch (controlsState.explorationMode) {
    case ExplorationMode.TEMPORAL:
      return thoughtsInTimeWindow;
    case ExplorationMode.PROFILE:
      return thoughtsInTimeWindow;
    case ExplorationMode.NEIGHBORHOOD:
      return [
        ...state.neighborhoodThoughts,
        ...thoughtsInTimeWindow
          .filter(t => state.neighborhoodThoughts.find(nt => nt.id === t.id) === undefined)
          .slice(0, controlsState.thoughtsOnScreenLimit - state.neighborhoodThoughts.length)
      ].sort((a, b) => a.id - b.id);

    case ExplorationMode.FREE:
      return thoughtsInTimeWindow;
    default:
      return thoughtsInTimeWindow;
  }
}

export function getThoughtsInTimeWindow() {
  const state = useGraphStore.getState();
  const { timeShift, temporalRenderedThoughts } = state;
  const controlsState = useGraphControlsStore.getState();

  return temporalRenderedThoughts.slice(
    Math.max(temporalRenderedThoughts.length - controlsState.thoughtsOnScreenLimit - timeShift, 0),
    Math.min(temporalRenderedThoughts.length - timeShift, temporalRenderedThoughts.length)
  );
}

// this function will initialize temporal array either in the latest time window or around a given thought if provided.
export function initializeTemporalThoughts(initialHighligthedId: number | null) {
  // console.log("initializing temporal thoughts with id", initialHighligthedId);

  var fetchedThoughts = [] as thoughtNodeDto[];

  const graphState = useGraphStore.getState();
  const controlsState = useGraphControlsStore.getState();

  const fetchAndSetStateAsync = async () => {
    const maxThoughts = controlsState.thoughtsOnScreenLimit;

    const response = await fetchTemporalThoughts({
      amount: maxThoughts ?? MAX_THOUGHTS_ON_SCREEN_FOR_LOGGED_OUT,
      aroundThoughtId: initialHighligthedId ?? undefined,
    });
    if (response.ok) {
      graphState.setTemporalRenderedThoughts(mapDtosToRenderedThoughts(response.data!));
      if (initialHighligthedId && initialHighligthedId !== 0) {
        MM_SetHighlightedThoughtById(initialHighligthedId);
      }
    }
  };
  fetchAndSetStateAsync();

  if (fetchedThoughts.length === 0) {
    return;
  }

  // const storage = localStorage.getItem('thoughts-cache');
  // console.log(storage);

  // const cachedPositions: ThoughtPositionCache[] = storage ? JSON.parse(storage) : [];

  // const newThoughts = fetchedThoughts.map<RenderedThought>(t =>
  // ({
  //   id: t.id, title: t.title,
  //   color: t.color, radius: BASE_RADIUS, author: t.author,
  //   links: t.links, backlinks: t.backlinks,
  //   position: { x: 0, y: 0 }, momentum: { x: 0, y: 0 }, forces: { x: 0, y: 0 },
  //   held: false, highlighted: false, timeOnScreen: 0, size: t.size, hovered: false, shape: 0, virtualLinks: [],
  // }));

  // //set position either by cache or by initial positions circle
  // let angle = 0;
  // newThoughts.forEach(thought => {
  //   if (initialHighligthedId === thought.id) {
  //     thought.highlighted = true;
  //   }

  //   const cached = cachedPositions.find(c => c.id === thought.id);
  //   if (cached) {
  //     thought.position = cached.position;
  //   }
  //   else {
  //     thought.position.x = SIM_WIDTH / 2 + Math.cos(angle) * INITIAL_POSITIONS_RADIUS;
  //     thought.position.y = SIM_HEIGHT / 2 + Math.sin(angle) * INITIAL_POSITIONS_RADIUS;
  //   }
  //   angle += Math.PI * 2 / newThoughts.length;
  // });

  const newThoughts = mapDtosToRenderedThoughts(fetchedThoughts);

  graphState.setTemporalRenderedThoughts(newThoughts);
  // if (initialHighligthedId && initialHighligthedId !== 0) {
  //   graphState.setHighlightedThoughtById(initialHighligthedId);
  // }
}

export const initializeConceptThoughts = async (aroundThoughtId: number | null, concept: string) => {
  const graphState = useGraphStore.getState();
  const controlsState = useGraphControlsStore.getState();

  const maxThoughts = controlsState.thoughtsOnScreenLimit;

  const response = await fetchTemporalThoughts({
    amount: maxThoughts ?? MAX_THOUGHTS_ON_SCREEN_FOR_LOGGED_OUT,
    aroundThoughtId: aroundThoughtId ?? undefined,
  }, concept);
  if (response.ok) {
    const newThoughts = mapDtosToRenderedThoughts(response.data!);
    graphState.setTemporalRenderedThoughts(newThoughts);
  }

}

// if the time window is exceded, this function will fetch new thoughts from api and update the temporal thoughts array
export const handleTemporalThoughtsTimeShifting = () => {
  const graphState = useGraphStore.getState();
  const controlsState = useGraphControlsStore.getState();


  const currentTemporalThoughts = graphState.temporalRenderedThoughts;
  // if (controlsState.explorationMode === ExplorationMode.CONCEPT) {
  //   console.log(currentTemporalThoughts);
  // }

  if (currentTemporalThoughts.length === 0) {
    return;
  }
  // console.log("fetching temporal thoughts:", graphState.fetchingTemporalThoughts)

  // EITHER - we need the after...
  if (!graphState.fetchingTemporalThoughts
    && graphState.timeShift < 0 && controlsState.explorationMode !== ExplorationMode.PROFILE) {
    //now im fetching entire profile at once. Once it's paged, this will have to be reworked

    graphState.setFetchingTemporalThoughts(true);
    // console.log("time window bound exceded into the future -> Updating temporal thoughts");
    // console.log(graphState.fetchingTemporalThoughts);

    const fetchAndSetStateAsync = async () => {
      // fetch the thoughts from BE
      const response = await fetchTemporalThoughts(
        { amount: controlsState.thoughtsOnScreenLimit * 2, afterThoughtId: currentTemporalThoughts[currentTemporalThoughts.length - 1].id },
        controlsState.explorationMode === ExplorationMode.CONCEPT ? graphState.viewedConcept?.tag : undefined);

      if (response.ok && response.data!.length > 0) {
        const convertedToRenderedThoughts = mapDtosToRenderedThoughts(response.data!);
        // to appear and apply forces sooner than neighborhood exploartion
        convertedToRenderedThoughts.forEach(t => t.timeOnScreen = NEW_NODE_INVISIBLE_FOR);

        graphState.temporalRenderedThoughts.push(...convertedToRenderedThoughts);
        graphState.setFrame(0);

        //handle time shift based on whether user is in live preview mode
        // console.log("ending thought is: ", graphState.endingThoughtId);
        if (graphState.endingThoughtId !== null
          && convertedToRenderedThoughts[0].id <= graphState.endingThoughtId) { //-> not in preview mode
          // console.log("not live preview - timeshift from ", graphState.timeShift);
          // console.log("to: ", convertedToRenderedThoughts.length + graphState.timeShift);
          graphState.setTimeShift(convertedToRenderedThoughts.length + graphState.timeShift);
        }
        else { // -> live preview
          // console.log("live preview - timeshift stays at: ", graphState.timeShift);
        }
      }
      setTimeout(() => graphState.setFetchingTemporalThoughts(false), 2000); // this might be a hack but it seems to work well... (to only fetch new thoughts every two seconds)
    }
    fetchAndSetStateAsync();
  }
  // OR we need the before... (this condition has to be tested second - the graph can have loaded only the first few thoughts)
  else if (!graphState.fetchingTemporalThoughts
    && currentTemporalThoughts[0].id !== graphState.beginningThoughtId
    && graphState.timeShift + controlsState.thoughtsOnScreenLimit > currentTemporalThoughts.length) {

    graphState.setFetchingTemporalThoughts(true);
    // console.log("time window bound exceded into the past -> Updating temporal thoughts");

    const fetchAndSetStateAsync = async () => {

      const response = await fetchTemporalThoughts({ amount: controlsState.thoughtsOnScreenLimit * 2, beforeThoughtId: currentTemporalThoughts[0].id },
        controlsState.explorationMode === ExplorationMode.CONCEPT ? graphState.viewedConcept?.tag : undefined
      );
      // console.log('new thoughts', response);
      if (response.ok) {
        graphState.setFetchingTemporalThoughts(false);
        if (response.data?.length === 0) {
          graphState.setBeginningThoughtId(currentTemporalThoughts[0].id);
          return;
        }
        const convertedToRenderedThoughts = mapDtosToRenderedThoughts(response.data!);
        // to appear and apply forces sooner than neighborhood exploartion
        convertedToRenderedThoughts.forEach(t => t.timeOnScreen = NEW_NODE_INVISIBLE_FOR);

        graphState.temporalRenderedThoughts.unshift(...convertedToRenderedThoughts);
        // const newRenderedThoughts = graphState.temporalRenderedThoughts;
        // graphState.setTemporalBoundIds(newRenderedThoughts[0].id, newRenderedThoughts[newRenderedThoughts.length - 1].id);

        // graphState.setTemporalRenderedThoughts(mapDtosToRenderedThoughts([...convertedToRenderedThoughts, ...currentTemporalThoughts]));
      }
      // todo: error handling
    };
    fetchAndSetStateAsync();
  }
}

export const clearNeighborhoodThoughts = () => {
  const graphState = useGraphStore.getState();
  graphState.setNeighborhoodThoughts([]);
}

export const updateNeighborhoodThoughts = (thoughtId: number) => {
  const graphState = useGraphStore.getState();
  const controlsState = useGraphControlsStore.getState();

  const fetchAndSetStateAsync = async () => {
    const response = await fetchNeighborhoodThoughts(thoughtId, MAX_DEPTH, controlsState.thoughtsOnScreenLimit);
    // console.log('neighborhood-thoughts', response);
    // const newNeighborhoodThoughts: RenderedThought[] = [];

    if (response.ok) {
      // console.log(response.data![0]);
      var l = 0;
      const fetchedThoughts = response.data!.flatMap(layer => {
        // first layer is the thought itself
        const layerRenderedThoughts = mapDtosToRenderedThoughts(layer);
        if (controlsState.explorationMode !== ExplorationMode.NEIGHBORHOOD) {
          return layerRenderedThoughts;
        }
        // set the times on screen so that layers fade in one after another
        layerRenderedThoughts.forEach(t => {
          if (t.timeOnScreen === 0) {
            t.timeOnScreen = -NEW_NODE_INVISIBLE_FOR * (Math.max(l - 1, 0));
          }
        });
        l++;
        return layerRenderedThoughts;
      });

      // graphState.setNeighborhoodThoughts(fetchedThoughts.sort((a, b) => a.id - b.id));
      const combinedThoughts =
        [
          ...fetchedThoughts,
          ...graphState.neighborhoodThoughts.filter(t => fetchedThoughts.find(ft => ft.id === t.id) === undefined)
        ];
      // console.log("first_part ", graphState.neighborhoodThoughts.filter(t => fetchedThoughts.find(ft => ft.id === t.id) === undefined));
      // console.log("second_part ", fetchedThoughts);
      // console.log("combined ", combinedThoughts);
      // const excededLimit = Math.max(0, combinedThoughts.length - graphState.userSettings.maxThoughts);
      //  console.log("exceded limit", excededLimit);
      const limitedNewThoughts = combinedThoughts.slice(0, controlsState.thoughtsOnScreenLimit);
      // console.log("limited new thoughts", limitedNewThoughts);
      graphState.setNeighborhoodThoughts(limitedNewThoughts);

      // if (graphControlsState.explorationMode === ExplorationMode.NEIGHBORHOOD) {
      //   const thoughtsToFadeOut = graphState.neighborhoodThoughts
      //     .filter(t => fetchedThoughts.find(ft => ft.id === t.id) === undefined && graphState.temporalRenderedThoughts.find(tt => tt.id === t.id) === undefined);
      //   thoughtsToFadeOut.forEach(t => t.timeOnScreen = NEW_NODE_INVISIBLE_FOR + NEW_NODE_FADE_IN_FRAMES);
      //   graphState.setFadeOutThoughts(thoughtsToFadeOut);
      // }
    }
  };
  fetchAndSetStateAsync();
}

// This function converts DTO to rendered thoughts including finding existing thoughts in the graph state
// (instead of replacing them with the new dtos each time)
export const mapDtosToRenderedThoughts = (thoughtNodeDtos: thoughtNodeDto[]): RenderedThought[] => {
  if (thoughtNodeDtos.length === 0) {
    return [];
  }

  const storage = localStorage.getItem('thoughts-cache');
  // console.log(storage);

  const cachedPositions: ThoughtPositionCache[] = storage ? JSON.parse(storage) : [];
  const temporalThoughts = useGraphStore.getState().temporalRenderedThoughts;
  const neighborhoodThoughts = useGraphStore.getState().neighborhoodThoughts;

  const newThoughts = thoughtNodeDtos.map<RenderedThought>(t => {
    const foundInNeigh = neighborhoodThoughts.find(tt => tt.id === t.id);
    if (foundInNeigh) {
      return foundInNeigh;
    }
    const foundInTimeWindow = getThoughtsInTimeWindow().find(tt => tt.id === t.id);
    if (foundInTimeWindow) {
      return foundInTimeWindow;
    }
    const foundInTemp = temporalThoughts.find(tt => tt.id === t.id);
    if (foundInTemp) {
      // console.log('found in temporal thoughts: ' + t.id);
      foundInTemp.timeOnScreen = 0;
      return foundInTemp;
    }
    return {
      id: t.id, title: t.title,
      color: t.color,
      radius: Math.min(BASE_RADIUS * Math.pow(REFERENCE_RADIUS_MULTIPLIER, t.size), useGraphControlsStore.getState().maxRadius),
      author: t.author,
      dateCreated: t.dateCreated,
      links: t.links, backlinks: t.backlinks,
      position: { x: 0, y: 0 }, momentum: { x: 0, y: 0 }, forces: { x: 0, y: 0 },
      held: false, highlighted: false, timeOnScreen: 0, size: t.size, hovered: false, virtualLinks: [],
      shape: t.shape
        // Math.random() > 0.5
        //   ? Math.random() > 0.5
        //     ? 0
        //     : 1
        //   : Math.random() > 0.5
        //     ? Math.random() > 0.5
        //       ? 2
        //       : 3
        //     : Math.random() > 0.5
        //       ? 4
        //       : 5
    }
  });

  //set position either by cache or by initial positions circle
  let angle = 0;
  // const graphState = useGraphStore.getState();
  newThoughts.forEach(thought => {
    if (thought.timeOnScreen === 0) {

      const cached = cachedPositions.find(c => c.id === thought.id);
      if (cached) {
        thought.position = cached.position;
      }
      else {
        //circular layout
        thought.position.x = SIM_WIDTH / 2 + Math.cos(angle) * INITIAL_POSITIONS_RADIUS;
        thought.position.y = SIM_HEIGHT / 2 + Math.sin(angle) * INITIAL_POSITIONS_RADIUS;
        //random layout
        // thought.position.x = graphState.viewport.position.x + Math.random() * graphState.viewport.width / graphState.viewport.zoom;
        // thought.position.y =  graphState.viewport.position.y + Math.random() * graphState.viewport.height / graphState.viewport.zoom;
        // circular layout in vierwport
        // console.log(graphState.viewport);
        // thought.position.x = graphState.viewport.position.x + graphState.viewport.width / graphState.viewport.zoom / 2 + Math.cos(angle) * INITIAL_POSITIONS_RADIUS;
        // thought.position.y = graphState.viewport.position.y + graphState.viewport.height / graphState.viewport.zoom / 2 + Math.sin(angle) * INITIAL_POSITIONS_RADIUS;
      }
      angle += Math.PI * 2 / newThoughts.length;
    }
  });

  return newThoughts;
};

export const HandleDeleteThought = (id: number) => {
  const graphState = useGraphStore.getState();

  graphState.setTemporalRenderedThoughts(graphState.temporalRenderedThoughts.filter(t => t.id !== id));
  graphState.setNeighborhoodThoughts(graphState.neighborhoodThoughts.filter(t => t.id !== id));
  graphState.unsetHighlightedThought();
}