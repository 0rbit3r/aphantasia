import { useEffect, useState } from "react";
import { fetchBiggestLog, fetchHotLog as fetchHotLog, fetchLatestLog as fetchLatestLog, fetchPinnedLog } from "../api/LogApiClient";
import { useNavigate } from "react-router-dom";
import { Localization } from "../locales/localization";
import { thoughtNodeDto } from "../api/dto/ThoughtDto";

// const PUBLIC_FOLDER = import.meta.env.VITE_PUBLIC_FOLDER;

interface ThoughtLogViewerProps {
    source: 'latest' | 'hot' | 'biggest' | 'pinned';
}

const ROWS_PER_LOG = 5;

// A component that displays thoughts as a history of posts.
const ThoughtListViewer = (props: ThoughtLogViewerProps) => {

    const [logs, setLogs] = useState<thoughtNodeDto[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const getLogs = async () => {
            const response = await (async () => {
                switch (props.source) {
                    case 'latest': {
                        return await fetchLatestLog(ROWS_PER_LOG);
                    }
                    case 'hot':
                        {
                           return await fetchHotLog(ROWS_PER_LOG);
                        }
                    case 'biggest':
                        {
                           return await fetchBiggestLog(ROWS_PER_LOG);
                        }
                    case 'pinned':
                        {
                            return await fetchPinnedLog(ROWS_PER_LOG);
                        }
                }
            })();
            if (response.ok) {
                setLogs(response.data!);
            }
        };
        getLogs();
    }, []);

    return (
        <div className="log-container">
            <div className="log-container-top-row">
                {(props.source === 'latest' &&
                    <>
                        <div className="log-title">{Localization.New}</div>
                        {/* <img className="play-button" draggable='false' src={PUBLIC_FOLDER + '/icons/play.svg'} onClick={_ => navigate("/graph/now")}></img> */}
                        <div className="log-top-row-button" onClick={_ => navigate("/graph/now")}>{Localization.LivePreview}</div>
                        <div className="log-top-row-button" onClick={_ => navigate("/list")}>{Localization.More}</div>
                    </>
                )}
                {(props.source === 'hot' &&
                    <>
                        <div className="log-title">{Localization.Hot}</div>
                    </>
                )}
                {(props.source === 'biggest' &&
                    <>
                        <div className="log-title">{Localization.Biggest}</div>
                    </>
                )}
                {(props.source === 'pinned' &&
                    <>
                        <div className="log-title">{Localization.Pinned}</div>
                    </>
                )}
            </div>
            {logs.map((thought, index) => (
                <div key={index} className="log" style={{ borderColor: thought.color }}
                    onClick={_ => navigate('/graph/' + thought.id)}
                    onMouseDown={e => { if (e.button === 1) { window.open('/graph/' + thought.id) } }}>
                    <div className="log-thought-title">{thought.title}</div>
                    <div className="log-bottom-row">
                        <div className="log-author" style={{ color: thought.color }}>{thought.author}</div>
                        {import.meta.env.VITE_LANGUAGE === 'cz' && <>
                            <div className="log-date">{Localization.Before} {thought.dateCreated}</div>
                        </>}
                        {import.meta.env.VITE_LANGUAGE === 'en' && <>
                            <div className="log-date">{thought.dateCreated} {Localization.Before}</div>
                        </>}
                    </div>
                </div>
            ))}
            {/* <button className="button-secondary" onClick={_ => navigate('/list')}>{Localization.AllThoughtsButton}</button> */}
        </div>
    )
};

export default ThoughtListViewer;