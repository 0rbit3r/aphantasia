import { createEffect, createSignal, Show } from 'solid-js';
import { Locale } from '../locales/localization'
import { Quips } from '../locales/quips'
import styles from '../styles/components/logoAndQuip.module.css'

export const LogoAndQuip = (props: { hide: boolean }) => {
    const [hidden, setHidden] = createSignal(props.hide);
    const [faded, setFaded] = createSignal(props.hide);

    createEffect(() => {
        if (hidden()) return;
        if (props.hide){
           setTimeout(() => setHidden(true), 1000);
            setFaded(true);
        }
    })
    return <Show when={!hidden()}>
        <div class={`${styles.header} ${faded() ? styles.hidden : ''}`}>
            <h1 class={styles.title}>{Locale.Title}</h1>
            <p class={styles.quip}>{Quips[Math.floor(Math.random() * (Quips.length - 1))]}</p>
        </div>
    </Show>
}