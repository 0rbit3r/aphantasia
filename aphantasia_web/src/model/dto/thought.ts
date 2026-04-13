import type { NodeShape } from "grafika";
import type { ConceptLight } from "./concept";
import type { UserColorName } from "./user"

export interface Thought {
    id: string;
    title: string;
    date: string;
    shape: number;
    size: number;
    color: string;

    author: UserColorName;
    content: string;

    links: ThoughtTitle[];
    replies: ThoughtTitle[];
    concepts: ConceptLight[];
}

export interface ThoughtTitle {

    id: string;
    title: string;
    color: string;
    shape: NodeShape;
}

export interface ThoughtNode {
    id: string;
    title: string;
    shape: number;
    size: number;
    color: string;
    x: number;
    y: number;
    links: string[];
    replies: string[];
    
    author: UserColorName;
    date: string;
}