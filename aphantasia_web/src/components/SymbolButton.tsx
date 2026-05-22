import css from '../styles/components/symbolButton.module.css';

interface SymbolButtonProps {
    img: string,
    action: () => void,
    dim?: boolean;
    disabled?: boolean;
}

export const SymbolButton = (props: SymbolButtonProps) => {
    return <button on:click={props.action} class={css.button}
        disabled= {props.disabled}>
        <img src={props.img} style={{
            filter: props.dim ? 'brightness(0.25)': 'none'
        }}/>
    </button>
}