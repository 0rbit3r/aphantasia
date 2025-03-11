import { Graphics, Text } from "pixi.js";
import { XAndY } from "./xAndY";

export interface RenderedThought {
  id: number,
  title: string,
  author: string,
  dateCreated?: string,
  content?: string,
  radius: number,
  size: number,
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