import type { NodeShape } from "grafika";
import type { ConceptLight } from "./concept";
import type { UserLight } from "./user"

export interface Thought {
    id: string;
    title: string;
    date: string;
    shape: number;
    size: number

    author: UserLight;
    content: string;
    
    links: ThoughtTitle[];
    replies: ThoughtTitle[];
    concepts: ConceptLight[];
}

export interface ThoughtLight {
    id: string;
    title: string;
    color: string;
    AuthorId: string;
    date: string;
    EpochId: string;
    size: number;
    author: UserLight;
    epochId: number;
    shape: NodeShape;
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
    replies:string[];
}