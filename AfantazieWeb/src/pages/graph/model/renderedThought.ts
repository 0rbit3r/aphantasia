import { Graphics, Text } from "pixi.js";
import { XAndY } from "./xAndY";
import { thoughtNodeDto } from "../../../api/dto/ThoughtDto";
import { BASE_RADIUS, INITIAL_POSITIONS_RADIUS, MAX_RADIUS, REFERENCE_RADIUS_MULTIPLIER, SIM_HEIGHT, SIM_WIDTH } from "../state_and_parameters/graphParameters";
import { ThoughtPositionCache } from "./thoughtPositionCache";

export interface RenderedThought {
  id: number,
  title: string,
  author: string,
  dateCreated?: string,
  content?: string,
  radius: number,
  color: string,

  graphics?: Graphics,
  text?: Text,

  highlighted: boolean
  held: boolean

  links: number[],
  backlinks: number[],

  position: XAndY,
  momentum: XAndY,
  forces: XAndY,

  timeOnScreen: number
}

export const mapDtosToRenderedThoughts = (thoughtNodeDtos: thoughtNodeDto[]): RenderedThought[] => {


  if (thoughtNodeDtos.length === 0) {
    return [];
  }

  const storage = localStorage.getItem('thoughts-cache');
  // console.log(storage);

  const cachedPositions: ThoughtPositionCache[] = storage ? JSON.parse(storage) : [];

  const newThoughts = thoughtNodeDtos.map<RenderedThought>(t =>
  ({
    id: t.id, title: t.title,
    color: t.color,
    radius: Math.min(BASE_RADIUS * Math.pow(REFERENCE_RADIUS_MULTIPLIER, t.size), MAX_RADIUS),
    author: t.author,
    dateCreated: t.dateCreated,
    links: t.links, backlinks: t.backlinks,
    position: { x: 0, y: 0 }, momentum: { x: 0, y: 0 }, forces: { x: 0, y: 0 },
    held: false, highlighted: false, timeOnScreen: 0
  }));

  //set position either by cache or by initial positions circle
  let angle = 0;
  // const graphState = useGraphStore.getState();
  newThoughts.forEach(thought => {
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
  });

  return newThoughts;
};