import type { ThoughtLight } from "../model/dto/thought"
import { ThoughtCard } from "./ThoughtCard";

export interface ThoughtsScrollerProps{
    thoughts: ThoughtLight[];
}


export const ThoughtsScroller = (props: ThoughtsScrollerProps) => {
   
   return <div>
        {props.thoughts.map(t=> <ThoughtCard thought={t}/>)}
   </div>
}