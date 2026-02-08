import type { ConceptLight } from "./concept";
import type { UserLight } from "./user";

export interface Thought {
    id: string;
    title: string;
    date: string;
    shape: number;
    size: number

    author: UserLight;
    content: string;
    
    links: ThoughtLight[];
    replies: ThoughtLight[];
    concepts: ConceptLight[];
}

export interface ThoughtLight {
    id: string;
    title: string;
    date: string;
    size: number;
    author: UserLight;
}

export interface ThoughtNode {
    id: string;
    title: string;
    shape: number;
    size: number;
    color: string;
    x: number;
    y: number;
}