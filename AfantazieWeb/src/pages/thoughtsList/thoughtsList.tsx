import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchThoughtTitles } from "../../api/graphClient";
import { thoughtColoredTitleDto } from "../../api/dto/ThoughtDto";

export default function ThoughtsList() {
    const [thoughtTitles, setThoughtTitles] = useState<thoughtColoredTitleDto[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const getThoughtList = async () => {
            const response = await fetchThoughtTitles();
            if (response.ok) {
                setThoughtTitles(response.data!.reverse());
            }
        };
        getThoughtList();
    }, []);

    return (
        <div className="content-container">
            <div className="list-container">
            {thoughtTitles.map((thought, index) => (
                <div key={index} className="thought" style={{ borderColor: thought.color }} onClick={_ => navigate('/graph/' + thought.id)}>
                    <div className="thought-title">{thought.title}</div>
                </div>
            ))}
        </div>
        </div>
    );
}