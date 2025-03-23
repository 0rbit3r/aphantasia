import { thoughtNodeDto } from "../../../api/dto/ThoughtDto";
import { fetchNeighborhoodThoughts, fetchTemporalThoughts } from "../../../api/graphClient";
import { useGraphStore } from "../state_and_parameters/GraphStore";
import { BASE_RADIUS, INITIAL_POSITIONS_RADIUS, MAX_RADIUS, MAX_THOUGHTS_ON_SCREEN_FOR_LOGGED_OUT, NEIGHBORHOOD_DEPTH, NEW_NODE_FADE_IN_FRAMES, NEW_NODE_INVISIBLE_FOR, REFERENCE_RADIUS_MULTIPLIER, SIM_HEIGHT, SIM_WIDTH } from "../state_and_parameters/graphParameters";
import { RenderedThought } from "../model/renderedThought";
import { ThoughtPositionCache } from "../model/thoughtPositionCache";
import { useGraphControlsStore } from "../state_and_parameters/GraphControlsStore";

// selects and returns thoughts to render and animate or consider highlighting in graph walk
export function getThoughtsOnScreen() {
  const state = useGraphStore.getState();
  const controlsState = useGraphControlsStore.getState();

  const thoughtsInTimeWindow = getThoughtsInTimeWindow();

  // no neighborhood -> return temporal thoughts
  if (controlsState.neighborhoodEnabled === false) {
    return thoughtsInTimeWindow;
  }

  // neighborhood -> return both temporal and neighborhood thoughts
  if (state.neighborhoodThoughts.length + thoughtsInTimeWindow.length > state.userSettings.maxThoughts) {
    return [
      ...state.neighborhoodThoughts,
      ...thoughtsInTimeWindow
        .filter(t => state.neighborhoodThoughts.find(nt => nt.id === t.id) === undefined)
        .slice(0, state.userSettings.maxThoughts - state.neighborhoodThoughts.length)
    ].sort((a, b) => a.id - b.id);
  }
  return [
    ...state.neighborhoodThoughts,
    ...thoughtsInTimeWindow
      .filter(t => state.neighborhoodThoughts.find(nt => nt.id === t.id) === undefined)
  ].sort((a, b) => a.id - b.id); //this is disgusting but later we could implement or use a "merge" as both arrays should already be sorted
}

export function getThoughtsInTimeWindow() {
  const state = useGraphStore.getState();
  const { timeShift, temporalRenderedThoughts, userSettings } = state;

  return temporalRenderedThoughts.slice(
    Math.max(temporalRenderedThoughts.length - userSettings.maxThoughts - timeShift, 0),
    Math.min(temporalRenderedThoughts.length - timeShift, temporalRenderedThoughts.length)
  );
}

// this function will initialize temporal array either in the latest time window or around a given thought if provided.
export function initializeTemporalThoughts(initialHighligthedId: number | null) {
  // console.log("initializing temporal thoughts with id", initialHighligthedId);

  var fetchedThoughts = [] as thoughtNodeDto[];

  const graphState = useGraphStore.getState();

  const fetchAndSetStateAsync = async () => {
    const maxThoughts = graphState.userSettings?.maxThoughts;

    const response = await fetchTemporalThoughts({
      amount: maxThoughts ?? MAX_THOUGHTS_ON_SCREEN_FOR_LOGGED_OUT,
      aroundThoughtId: initialHighligthedId ?? undefined
    });
    if (response.ok) {
      graphState.setTemporalRenderedThoughts(mapDtosToRenderedThoughts(response.data!));
      if (initialHighligthedId && initialHighligthedId !== 0) {
        graphState.setHighlightedThoughtById(initialHighligthedId);
      }
    }
  };
  fetchAndSetStateAsync();

  if (fetchedThoughts.length === 0) {
    return;
  }

  const storage = localStorage.getItem('thoughts-cache');
  // console.log(storage);

  const cachedPositions: ThoughtPositionCache[] = storage ? JSON.parse(storage) : [];

  const newThoughts = fetchedThoughts.map<RenderedThought>(t =>
  ({
    id: t.id, title: t.title,
    color: t.color, radius: BASE_RADIUS, author: t.author,
    links: t.links, backlinks: t.backlinks,
    position: { x: 0, y: 0 }, momentum: { x: 0, y: 0 }, forces: { x: 0, y: 0 },
    held: false, highlighted: false, timeOnScreen: 0, size: t.size, hovered: false, shape: 0
  }));

  //set position either by cache or by initial positions circle
  let angle = 0;
  newThoughts.forEach(thought => {
    if (initialHighligthedId === thought.id) {
      thought.highlighted = true;
    }

    const cached = cachedPositions.find(c => c.id === thought.id);
    if (cached) {
      thought.position = cached.position;
    }
    else {
      thought.position.x = SIM_WIDTH / 2 + Math.cos(angle) * INITIAL_POSITIONS_RADIUS;
      thought.position.y = SIM_HEIGHT / 2 + Math.sin(angle) * INITIAL_POSITIONS_RADIUS;
    }
    angle += Math.PI * 2 / newThoughts.length;
  });

  graphState.setTemporalRenderedThoughts(newThoughts);
  // if (initialHighligthedId && initialHighligthedId !== 0) {
  //   graphState.setHighlightedThoughtById(initialHighligthedId);
  // }
}

// if the time window is exceded, this function will fetch new thoughts from api and update the temporal thoughts array
export const updateTemporalThoughts = () => {
  const graphState = useGraphStore.getState();

  const currentTemporalThoughts = graphState.temporalRenderedThoughts;

  if (currentTemporalThoughts.length === 0) {
    return;
  }

  // EITHER - we need the after...
  if (graphState.fetchingTemporalThoughts === false
    && graphState.timeShift < 0) {

    graphState.setFetchingTemporalThoughts(true);
    // console.log("time window bound exceded into the future -> Updating temporal thoughts");

    const fetchAndSetStateAsync = async () => {
      // fetch the thoughts from BE
      const response = await fetchTemporalThoughts({ amount: graphState.userSettings.maxThoughts * 2, afterThoughtId: currentTemporalThoughts[currentTemporalThoughts.length - 1].id });

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
  else if (graphState.fetchingTemporalThoughts === false
    && currentTemporalThoughts[0].id !== graphState.beginningThoughtId
    && graphState.timeShift + graphState.userSettings.maxThoughts > currentTemporalThoughts.length) {

    graphState.setFetchingTemporalThoughts(true);
    // console.log("time window bound exceded into the past -> Updating temporal thoughts");

    const fetchAndSetStateAsync = async () => {

      const response = await fetchTemporalThoughts({ amount: graphState.userSettings.maxThoughts * 2, beforeThoughtId: currentTemporalThoughts[0].id });
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
  const graphControlsState = useGraphControlsStore.getState();

  const fetchAndSetStateAsync = async () => {
    const response = await fetchNeighborhoodThoughts(thoughtId, NEIGHBORHOOD_DEPTH);
    // console.log('neighborhood-thoughts', response);
    // const newNeighborhoodThoughts: RenderedThought[] = [];

    if (response.ok) {
      // console.log(response.data![0]);
      var l = 0;
      const fetchedThoughts = response.data!.flatMap(layer => {
        // first layer is the thought itself
        const layerRenderedThoughts = mapDtosToRenderedThoughts(layer);
        if (graphControlsState.neighborhoodEnabled === false) {
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
      graphState.setNeighborhoodThoughts(fetchedThoughts.sort((a, b) => a.id - b.id));

      if (graphControlsState.neighborhoodEnabled) {
        const thoughtsToFadeOut = graphState.neighborhoodThoughts
          .filter(t => fetchedThoughts.find(ft => ft.id === t.id) === undefined && graphState.temporalRenderedThoughts.find(tt => tt.id === t.id) === undefined);
        thoughtsToFadeOut.forEach(t => t.timeOnScreen = NEW_NODE_INVISIBLE_FOR + NEW_NODE_FADE_IN_FRAMES);
        graphState.setFadeOutThoughts(thoughtsToFadeOut);
      }
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
      // console.log('found in neighborhood thoughts: ' + t.id);
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
      radius: Math.min(BASE_RADIUS * Math.pow(REFERENCE_RADIUS_MULTIPLIER, t.size), MAX_RADIUS),
      author: t.author,
      dateCreated: t.dateCreated,
      links: t.links, backlinks: t.backlinks,
      position: { x: 0, y: 0 }, momentum: { x: 0, y: 0 }, forces: { x: 0, y: 0 },
      held: false, highlighted: false, timeOnScreen: 0, size: t.size, hovered: false,
      shape: //t.shape
        Math.random() > 0.5
          ? Math.random() > 0.5
            ? 0
            : 1
          : Math.random() > 0.5
            ? Math.random() > 0.5
              ? 2
              : 3
            : Math.random() > 0.5
              ? 4
              : 5
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