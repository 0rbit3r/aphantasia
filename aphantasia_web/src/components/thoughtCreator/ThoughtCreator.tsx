import { createSignal, useContext } from "solid-js"
import { AphantasiaStoreContext } from "../../contexts/aphantasiaStoreContext"
import _ from '../../styles/common/controls.module.css';
import css from '../../styles/components/thoughtCreator.module.css';
import { ShapeSelector } from "./ShapeSelector";
import { ScreenOrientation } from "../../contexts/screenOrientationContext";
import { Portal } from "solid-js/web";
import { LinkAdder } from "./LinkAdder";

export const ThoughtCreator = () => {
    const store = useContext(AphantasiaStoreContext)!;
    const scrOrientation = useContext(ScreenOrientation);

    const node = store.get.grafika.getData().nodes.find(n => n.id === 'created_thought');

    const [title, setTitle] = createSignal('');
    const [content, setContent] = createSignal('');

    return <div classList={{
        [css.thought_creator_container]: true,
        [css.thought_creator_container_land]: scrOrientation.isLandscape()
    }}>
        <div class={css.title_and_shape_cont}>
            <textarea placeholder='Title'
                class={css.title_input}
                value={title()}
                on:input={e => {
                    setTitle(e.target.value);
                    if (node) node.text = e.target.value;
                }} />
            <ShapeSelector shapeSelected={shape => node && (node.shape = shape)}></ShapeSelector>
        </div>
        <textarea placeholder='Content'
            class={css.content_input}
            value={content()}
            on:change={e => setContent(e.target.value)} />
        <div class={css.button_bar}>

            <button class={css.button_bar_button}>Link</button>
            <Portal><LinkAdder somth={null!}/></Portal>
            <button class={css.button_bar_button}>Blept</button>
        </div>
    </div>
}