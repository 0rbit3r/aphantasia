import type { ConceptLight } from "./concept";
import type { UserLight } from "./User";

export interface Thought {
    id: string;
    title: string;
    date: string;
    shape: number;
    size: number;

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
    shape: number;
    size: number;
    
    author: UserLight;
}

export interface ThoughNode {
    id: string;
    title: string;
    date: string;
    shape: number;
    size: number; 
    color: string;
}