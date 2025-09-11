import { Graphics, RenderTexture, Text } from "pixi.js";
import { XAndY } from "./xAndY";
import { ThoughtShape } from "./thoughtShape";

export interface RenderedThought {
  id: number,
  title: string,
  author: string,
  dateCreated?: string,
  content?: string,
  radius: number,
  size: number,
  color: string,
  shape: ThoughtShape,

  graphics?: Graphics,
  text?: Text,

  highlighted: boolean,
  held: boolean,
  hovered: boolean,

  links: number[],
  backlinks: number[],
  virtualLinks: number[],

  renderedLinks: RenderedEdge[],
  renderedBacklinks: RenderedEdge[],
  renderedVirtualLinks: RenderedEdge[],

  position: XAndY,
  momentum: XAndY,
  forces: XAndY,

  timeOnScreen: number
}

export interface RenderedEdge {
  sourceThought: RenderedThought;
  targetThought: RenderedThought;

  graphics?: Graphics;
}