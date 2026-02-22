import { createEffect, createSignal, Show } from 'solid-js';
import { Locale } from '../locales/localization'
import { Quips } from '../locales/quips'
import css from '../styles/components/logoAndQuip.module.css'

export const LogoAndQuip = (props: { hide: boolean }) => {
    const [hidden, setHidden] = createSignal(props.hide);
    const [faded, setFaded] = createSignal(props.hide);

    createEffect(() => {
        if (hidden()) return;
        if (props.hide) {
            setTimeout(() => setHidden(true), 1000);
            setFaded(true);
        }
    })
    return <>
        <Show when={!hidden()}>
            <div class={`${css.version_container} ${faded() ? css.hidden : ''}`}>
                <div class={css.version}>{__APP_VERSION__} - Public Beta</div>
            </div>
        </Show>
        <Show when={!hidden()}>
            <div class={`${css.header} ${faded() ? css.hidden : ''}`}>
                <h1 class={css.title}>{Locale.Title}</h1>
                <p class={css.quip}>{Quips[Math.floor(Math.random() * (Quips.length - 1))]}</p>
            </div>
        </Show>
    </>
}