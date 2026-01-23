import {type JSX } from 'solid-js';
import css from '../styles/common/symbolButton.module.css';

interface SymbolButtonProps {
    img: JSX.Element,
    action: () => void
}

export const SymbolButton = (props: SymbolButtonProps) => {
    return <button on:click={props.action} class={css.button}>
        {props.img}
    </button>
}