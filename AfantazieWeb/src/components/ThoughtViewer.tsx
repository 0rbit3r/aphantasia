import { useState } from "react";
import { fullThoughtDto, thoughtColoredTitleDto} from "../api/dto/ThoughtDto";
import { useNavigate } from "react-router-dom";
import { LocationState } from "../interfaces/LocationState";
import { MediaContent } from "./MediaContent";
import { getThoughtsOnScreen } from "../pages/graph/simulation/thoughtsProvider";
import { useGraphControlsStore } from "../pages/graph/state_and_parameters/GraphControlsStore";
import { useGraphStore } from "../pages/graph/state_and_parameters/GraphStore";
import tinycolor from "tinycolor2";
import { ExplorationMode } from "../pages/graph/simulation/modesManager";

interface ThoughtViewerProps {
    thought: fullThoughtDto,
    links: thoughtColoredTitleDto[],
    backlinks: thoughtColoredTitleDto[],
    setHighlightedThoughtId: (id: number) => void,
    clickedOnUser: (username: string) => void,
    closePreview: () => void,
}

const PUBLIC_FOLDER = import.meta.env.VITE_PUBLIC_FOLDER;

export const ThoughtViewer = (props: ThoughtViewerProps) => {

    const navigate = useNavigate();

    const [extendedHeight, setExtendedHeight] = useState(false);
    const setExplorationMode = useGraphControlsStore((state) => state.setExplorationMode);

    const setLockedOnHighlighted = useGraphStore((state) => state.setLockedOnHighlighted);

    const handleLinkClick = (id: number) => {

        if (!getThoughtsOnScreen().find(t => t.id == id)) {
            setExplorationMode(ExplorationMode.NEIGHBORHOOD);
        }
        props.setHighlightedThoughtId(id);
    }

    const handleMiddleMouseLinkClick = (e: React.MouseEvent, id: number) => {
        console.log('click', e.button);
        if (e.button === 1) {
            e.preventDefault();
            window.open('/graph/' + id, '_blank');
        }
    }

    const handleReplyClick = (id: number) => {
        if (!getThoughtsOnScreen().find(t => t.id == id)) {
            setExplorationMode(ExplorationMode.NEIGHBORHOOD);
        }
        props.setHighlightedThoughtId(id);
    }

    const handleTitleClick = () => {
        //todo - if thought is not visible - bring it into view (timeshift?)
        if (!getThoughtsOnScreen().find(t => t.id == props.thought.id)) {
            // if (getThoughtsInTimeWindow().find(t => t.id == props.thought.id)) {
            setExplorationMode(ExplorationMode.NEIGHBORHOOD);
            // }
            // else { // toto they can be out? maybe? In that case either time shift or fetch
            //     setExplorationMode(true);
            // }
        }
        setLockedOnHighlighted(true);
    }


    const renderContentWithThoughtLinks = (text: string) => {
        // thought links first
        const parts = text.split(/\[([0-9]*?)\]\[(.*?)\]/g);
        // console.log("all : " , parts);
        const result = [];
        for (let i = 0; i < parts.length; i += 3) {
            const id = parseInt(parts[i + 1]);

            const weblinksBefore = renderContentWithHashtags(parts[i]);
            result.push(weblinksBefore);

            const thoughtTitle = parts[i + 2];
            result.push(<span
                className='in-text-thought-ref'
                style={{ color: props.links.find(t => t.id == id)?.color }}
                key={'link' + i}
                onClick={_ => handleLinkClick(id)}
                onMouseDown={e => handleMiddleMouseLinkClick(e, id)}

            >
                {thoughtTitle}
            </span>);
        }
        return result;
    }

    const renderContentWithHashtags = (text: string) => {
        const parts = text.split(/(?:^|\s)(#(?:[\p{L}\d]+(?:\/(?=[\p{L}\d]))?(?:[\p{L}\d]+)?){1,2})(?=\s|$)/gu);

        //Oh god... todo
        // console.log("all : " , parts);

        // console.log("all : " , parts);
        const result = [];
        for (let i = 0; i < parts.length; i += 3) {
            const id = parseInt(parts[i + 1]);

            const weblinksBefore = renderContentWithWebLinks(parts[i]);
            result.push(weblinksBefore);

            const thoughtTitle = parts[i + 2];
            result.push(<span
                className='in-text-thought-ref'
                style={{ color: props.links.find(t => t.id == id)?.color }}
                key={'link' + i}
                onClick={_ => handleLinkClick(id)}
                onMouseDown={e => handleMiddleMouseLinkClick(e, id)}

            >
                {thoughtTitle}
            </span>);
        }
        return result;
    }

    const renderContentWithWebLinks = (text: string) => {
        if (!text) {
            return '';
        }
        const urlRegex = /(https?:\/\/[^\s/$.?#].[^\s]*)/gi;
        const parts = text.split(urlRegex);
        const result = [];
        for (let i = 0; i < parts.length; i += 2) {
            result.push(renderContentFormatted(parts[i]));
            result.push(<a key={'link' + i} href={parts[i + 1]} target='_blank' style={{ color: "#777" }}>{parts[i + 1]}</a>);
        }
        return result;

    }

    const renderContentFormatted = (text: string) => {
        if (!text) {
            return '';
        }
        const urlRegex = /\*\*([\s\S]+?)\*\*/m;
        const parts = text.split(urlRegex);
        const result = [];
        for (let i = 0; i < parts.length; i += 2) {
            result.push(renderContentWitthItalics(parts[i]));
            result.push(<strong key={'bold' + i} style={{ color: tinycolor(props.thought.color).lighten(15).toString() }}>{parts[i + 1]}</strong>);
        }
        return result;
    }

    const renderContentWitthItalics = (text: string) => {
        if (!text) {
            return '';
        }
        const parts = text.split(/__([\s\S]+?)__/m);
        const result = [];
        for (let i = 0; i < parts.length; i += 2) {
            result.push(parts[i]);
            result.push(<em key={'italic' + i} style={{ color: tinycolor(props.thought.color).toString() }}>{parts[i + 1]}</em>);
        }
        return result;
    }

    return (
        <>
            <div className="thought-viewer-container" style={{ borderColor: props.thought.color }}>
                <div className="thought-viewer-top-row" >
                    <div className="thought-viewer-title" style={{ color: props.thought.color }} onClick={handleTitleClick}>{props.thought.title}</div>
                    <div className="thought-viewer-id">{props.thought.id}</div>
                </div>
                <p className={extendedHeight ? "thought-viewer-content-extended" : "thought-viewer-content"}>
                    {/* {(props.neighborhoodLoaded && */}
                        {renderContentWithThoughtLinks(props.thought.content)}
                </p>
                <MediaContent id={props.thought.id}>
                </MediaContent>
                <div className="thought-viewer-botom-row">
                    <button className="thought-viewer-author" style={{ color: props.thought.color }}
                        onClick={() => props.clickedOnUser(props.thought.author)}>
                        {props.thought.author}</button>
                    <div className="thought-viewer-date">{props.thought.dateCreated}</div>
                </div>
                {extendedHeight && props.thought !== null && props.backlinks.length > 0 &&
                    <>
                        <div className='responses-container'>
                            {props.backlinks.map(t =>
                                <span key={`back-link-${t.id}`} className='search-result-item' style={{ borderColor: t.color }}
                                    onClick={_ => handleReplyClick(t.id)}
                                    onMouseDown={e => handleMiddleMouseLinkClick(e, t.id)}>

                                    {t.title}</span>
                            )}
                        </div>
                    </>}
            </div>
            <div className='thought-viewer-controls-container'>
                <div className='thought-viewer-controls'>

                    <button className='thought-viewer-controls-button' onClick={props.closePreview}>
                        <img draggable='false' src={PUBLIC_FOLDER + '/icons/close.svg'}></img>
                    </button>

                    <button
                        className='thought-viewer-controls-button'
                        onClick={() => {
                            if (props.thought !== null) {
                                navigate('/create-thought', { state: { thoughtId: props.thought.id } as LocationState });
                            }
                        }}>
                        <img draggable='false' src={PUBLIC_FOLDER + '/icons/reply.svg'}></img>
                    </button>

                    <button className='thought-viewer-controls-button' onClick={() => { setExtendedHeight(!extendedHeight) }}>
                        {extendedHeight
                            ? <img draggable='false' src={PUBLIC_FOLDER + '/icons/minimize.svg'}></img>
                            : <img draggable='false' src={PUBLIC_FOLDER + '/icons/fullscreen.svg'}></img>
                        }
                    </button>
                </div>
            </div>
        </>
    )
}