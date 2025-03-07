import { useEffect, useState } from "react";
import { fullThoughtDto} from "../api/dto/ThoughtDto";
import { RenderedThought } from "../pages/graph/model/renderedThought";
import { useNavigate } from "react-router-dom";
import { LocationState } from "../interfaces/LocationState";
import { MediaContent } from "./MediaContent";

interface ThoughtViewerProps {
    thought: fullThoughtDto,
    landscapeMode: boolean,
    setHighlightedThoughtId: (id: number) => void,
    closePreview: () => void,
    neighborhoodThoughts: RenderedThought[]
}

const PUBLIC_FOLDER = import.meta.env.VITE_PUBLIC_FOLDER;

export const ThoughtViewer = (props: ThoughtViewerProps) => {

    const navigate = useNavigate();

    const [extendedHeight, setExtendedHeight] = useState(false);
    const [neigborhoodThoughtsLoaded, setNeigborhoodThoughtsLoaded] = useState<boolean>(false);

    // renders thought content including colorful clickable references
    const renderContentWithReferences = (text: string) => {
        const parts = text.split(/\[([0-9]*?)\]\((.*?)\)/g);
        const result = [];
        for (let i = 0; i < parts.length; i += 3) {
            const id = parseInt(parts[i + 1]);
            result.push(parts[i]);
            result.push(<span
                className='in-text-thought-ref'
                style={{ color: props.neighborhoodThoughts.find(t => t.id == id)?.color }}
                key={'link' + i}
                onClick={() => props.setHighlightedThoughtId(id)}>
                {parts[i + 2]}
            </span>);
        }
        return result;
    }

    useEffect(() => {
        if (props.neighborhoodThoughts.length > 0) {
            setNeigborhoodThoughtsLoaded(true);
        }
    }, [props.neighborhoodThoughts]);

    useEffect(() => {
        console.log('extendedHeight', extendedHeight);
    }, [extendedHeight]);

    return (
        <>
            <div className="thought-viewer-container" style={{ borderColor: props.thought.color }}>
                <div className="thought-viewer-top-row" >
                    <div className="thought-viewer-title" style={{ color: props.thought.color }}>{props.thought.title}</div>
                    <div className="thought-viewer-id">{props.thought.id}</div>
                </div>
                <p className={extendedHeight ? "thought-viewer-content-extended" : "thought-viewer-content"}>
                    {(neigborhoodThoughtsLoaded &&
                        renderContentWithReferences(props.thought.content))}
                    <MediaContent id={props.thought.id}>
                    </MediaContent>
                </p>
                <div className="thought-viewer-botom-row">
                    <div className="thought-viewer-author" style={{ color: props.thought.color }}>
                        {props.thought.author}</div>
                    <div className="thought-viewer-date">{props.thought.dateCreated}</div>
                </div>
                {extendedHeight && props.thought !== null && props.neighborhoodThoughts.map(t => t.links.includes(props.thought.id)).length > 0 &&
                    <>
                        <div className='responses-container'>
                            {props.neighborhoodThoughts.map(t => t.links.includes(props.thought.id) &&
                                <span key={`back-link-${t.id}`} className='search-result-item' style={{ borderColor: t.color }}
                                    onClick={_ => props.setHighlightedThoughtId(t.id)}>{t.title}</span>
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