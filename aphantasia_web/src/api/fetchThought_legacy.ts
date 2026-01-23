import type { Thought } from "../model/thought";

export function fetchThought(id: string): Promise<Thought> {
    return fetch('http://192.168.20.47:5001/api/thoughts/' + id)
        .then(response => response.json())
        .then(obj => {
            const thought: Thought = {
                id: obj.id.toString(),
                content: obj.content,
                author: {color: obj.color, id: null!, name: obj.author},
                date: obj.dateCreated,
                links: obj.links.map((l: number) => l.toString()),
                replies: obj.backlinks.map((l: number) => l.toString()), 
                shape: obj.shape,
                size: obj.size,
                title: obj.title,
                concepts: []
            }
            return thought;
        });
}