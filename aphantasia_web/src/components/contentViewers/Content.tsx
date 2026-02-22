import { createEffect } from "solid-js";
import css from "../../styles/components/content.module.css"

export interface ContentProps {
    text: string;
    onThoughtLinkClick?: (id: string, middleClick: boolean) => void;
    onConceptLinkClick?: (id: string, middleClick: boolean) => void;
    thoughtColors?: Map<string, string>;
    conceptColors?: Map<string, string>;
    color?: string;
}

export const Content = (props: ContentProps) => {
    return <div class={css.content_container}>
        {renderContentWithThoughtLinks(props)}
    </div>
}

const renderContentWithThoughtLinks = (props: ContentProps) => {
    createEffect(()=> {

        console.log(props.thoughtColors);
    })
    // thought links first
    const parts = props.text.split(/\[(.*?)\]\[(.*?)\]/g);//TODO!!! rules for the id part
    //console.log("splittedPartsInLinks : ", parts);
    const result = [];
    for (let i = 0; i < parts.length; i += 3) {
        const id = parts[i + 1];

        const weblinksBefore = renderContentWithConcepts(
            { ...props, text: parts[i]}
        );
        result.push(weblinksBefore);

        const thoughtTitle = parts[i + 2];
        const color = props.thoughtColors?.get(id) || "#676767";
        result.push(<span
            class={css.thought_ref}
            style={{ color: color }}
            onClick={_ => props.onThoughtLinkClick && props.onThoughtLinkClick(id, false)}
            onMouseDown={_ => props.onThoughtLinkClick && props.onThoughtLinkClick(id, true)}

        >
            {thoughtTitle}
        </span>);
    }
    return result;
}

export const CONCEPT_REGEX = /(^|\s)(_[0-9a-zA-Z]+)(_[0-9a-zA-Z]+)?(_[0-9a-zA-Z]+)?/g;
const renderContentWithConcepts = (props: ContentProps) => {
    const parts = props.text.split(CONCEPT_REGEX);

    const result = [];
    for (let i = 0; i < parts.length; i += 5) {

        const weblinksBefore = renderContentWithWebLinks(
            { ...props, text: parts[i] + (parts[i + 1] ? parts[i + 1] : '')});
        result.push(weblinksBefore);
        ;
        result.push(<span
            class={css.concept_ref}
            // style={{ color: props.links.find(t => t.id == id)?.color }}
            // onClick={_ => handleLinkClick(id)}
            onMouseDown={_ => props.onConceptLinkClick && props.onConceptLinkClick(parts[i + 2], false)}
        >
            {parts[i + 2]}
        </span>);
        if (parts[i + 3]) {
            result.push(<span
                class={css.concept_ref}
                // style={{ color: props.links.find(t => t.id == id)?.color }}
                onClick={_ => props.onConceptLinkClick && props.onConceptLinkClick(parts[i + 2] + parts[i + 3], false)}
            // onMouseDown={e => handleMiddleMouseLinkClick(e, id)}
            >
                {parts[i + 3]}
            </span>);
            if (parts[i + 4]) {
                result.push(<span
                    class={css.concept_ref}
                    // style={{ color: props.links.find(t => t.id == id)?.color }}
                    onClick={_ => props.onConceptLinkClick && props.onConceptLinkClick(parts[i + 2] + parts[i + 3] + parts[i + 4], false)}
                // onMouseDown={e => handleMiddleMouseLinkClick(e, id)}
                >
                    {parts[i + 4]}
                </span>);
            }
        }
    }
    return result;
}

const renderContentWithWebLinks = (props: ContentProps) => {
    if (!props.text) {
        return '';
    }
    const urlRegex = /(https?:\/\/[^\s/$.?#].[^\s]*)/gi;
    const parts = props.text.split(urlRegex);
    const result = [];
    for (let i = 0; i < parts.length; i += 2) {
        result.push(renderContentWithBold({ ...props, text: parts[i]}));
        result.push(<a href={parts[i + 1]} target='_blank' style={{ color: "#777" }}>{parts[i + 1]}</a>);
    }
    return result;

}

const renderContentWithBold = (props: ContentProps) => {
    if (!props.text) {
        return '';
    }
    const urlRegex = /\*\*([\s\S]+?)\*\*/m;
    const parts = props.text.split(urlRegex);
    const result = [];
    for (let i = 0; i < parts.length; i += 2) {
        result.push(renderContentWitthItalics({ ...props, text: parts[i]}));
        result.push(<strong style={{ color: props.color, "font-weight": "bolder" }}>{parts[i + 1]}</strong>);
    }
    return result;
}

const renderContentWitthItalics = (props: ContentProps) => {
    if (!props.text) {
        return '';
    }
    const parts = props.text.split(/__([\s\S]+?)__/m);
    const result = [];
    for (let i = 0; i < parts.length; i += 2) {
        result.push(parts[i]);
        result.push(<em  style={{ color:props.color }}>{parts[i + 1]}</em>);
    }
    return result;
}