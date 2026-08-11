import css from '../styles/components/conceptCard.module.css';
import { useContext } from "solid-js";
import { handleForwardExploration } from "../stateManager/handleForwardExploration";
import { StoreContext } from "../contexts/storeContext";
import type { ConceptGraphNode } from '../model/dto/concept';


export const ConceptCard = (props: { concept: ConceptGraphNode }) => {
    const store = useContext(StoreContext)!;

    return <div class={css.concept_card}
        style={{ ['border-color']: props.concept?.color ?? 'white' }}
        on:pointerup={_ => {
            if (props.concept)
                setTimeout(() => handleForwardExploration(store, { mode: 'concept', focus: props.concept.tag }),
            50); // prevent thought card click from firing on once thoughts load ( todo try pointerup?)
            // move up

        }}>
        <div class={css.tag}>
            {props.concept?.tag ?? "[null]"}
        </div>
        <div class={css.count}
            style={{ color: props.concept.color }}>
            {props.concept.thoughtCount}</div>
    </div>
}