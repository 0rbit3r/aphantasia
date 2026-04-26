import css from '../styles/components/thoughtCard.module.css';
import circleIcon from '../assets/icons/circle.svg';
import squareIcon from '../assets/icons/square.svg';
import diamondIcon from '../assets/icons/diamond.svg';
import triangleIcon from '../assets/icons/triangle.svg';
import downTriangleIcon from '../assets/icons/down-triangle.svg';
import crossIcon from '../assets/icons/cross.svg';
import heartIcon from '../assets/icons/heart.svg';
import { Match, Switch, useContext } from "solid-js";
import { NodeShape } from "grafika";
import { handleForwardExploration } from "../stateManager/handleForwardExploration";
import { StoreContext } from "../contexts/storeContext";
import type { ThoughtNode } from '../model/dto/thought';


export const ThoughtCard = (props: { thought: ThoughtNode }) => {
    const store = useContext(StoreContext)!;

    return <div class={css.thought_card}
        style={{ ['border-color']: props.thought?.color ?? 'white' }}
        on:click={_ => {
            if (props.thought)
                handleForwardExploration(store, { mode: 'explore', focus: props.thought.id });
            else
                store.set('screenMessages', prev => [...prev, {
                    color: 'yellow', text: 'This thought is thought-less'
                }]);
        }}>
        <div class={css.title_and_shape}>
            <div class={css.title}>
                {props.thought?.title ?? "[null]"}
            </div>
            <div class={css.shape_icon}>
                <Switch>
                    <Match when={props.thought?.shape === NodeShape.Circle}>
                        <img src={circleIcon}></img>
                    </Match>
                    <Match when={props.thought?.shape === NodeShape.Square}>
                        <img src={squareIcon}></img>
                    </Match>
                    <Match when={props.thought?.shape === NodeShape.Diamond}>
                        <img src={diamondIcon}></img>
                    </Match>
                    <Match when={props.thought?.shape === NodeShape.UpTriangle}>
                        <img src={triangleIcon}></img>
                    </Match>
                    <Match when={props.thought?.shape === NodeShape.DownTriangle}>
                        <img src={downTriangleIcon}></img>
                    </Match>
                    <Match when={props.thought?.shape === NodeShape.Cross}>
                        <img src={crossIcon}></img>
                    </Match>
                    <Match when={props.thought?.shape === NodeShape.Heart}>
                        <img src={heartIcon}></img>
                    </Match>
                </Switch>
            </div>
        </div>
        <div class={css.date_and_user}>
            <div class={css.date}>{props.thought.date}</div>
            <div class={css.username}
                style={{ color: props.thought.author.color }}>
                {props.thought.author.username}</div>
        </div>
    </div>
}