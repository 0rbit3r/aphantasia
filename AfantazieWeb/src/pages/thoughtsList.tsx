import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { thoughtNodeDto } from "../api/dto/ThoughtDto";
import { fetchThoughtTitles } from "../api/graphClient";

export default function ThoughtsList() {
    const [thoughts, setThoughts] = useState<thoughtNodeDto[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const getThoughtList = async () => {
            const response = await fetchThoughtTitles();
            if (response.ok) {
                setThoughts(response.data!.reverse());
            }
        };
        getThoughtList();
    }, []);

    return (
        <div className="content-container notifications-content-container">
            <div className="log-container">
                {thoughts.map((thought, index) => (
                    <div key={index} className="log" style={{ borderColor: thought.color }} onClick={_ => navigate('/graph/' + thought.id)}>
                        <div className="log-thought-title">{thought.title}</div>
                        <div className="log-bottom-row">
                            <div className="log-author" style={{ color: thought.color }}>{thought.author}</div>
                            <div className="log-date">{thought.dateCreated}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}