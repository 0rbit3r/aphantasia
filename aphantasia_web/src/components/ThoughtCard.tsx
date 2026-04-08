import type { ThoughtLight } from "../model/dto/thought"

export interface ThoughtCardProps {
    thought: ThoughtLight;
}

export const ThoughtCard = (props: ThoughtCardProps) => {

    return <div>
        {props.thought.title}
    </div>
}