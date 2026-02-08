import type { Thought} from "../model/dto/thought";

export function fetchThought(id: string): Promise<Thought> {
    return fetch('http://192.168.20.39:5001/api/thoughts/' + id)
        .then(response => response.json());
}