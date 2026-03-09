import type { ThoughtLight } from "./thought";

export interface Concept {
    readonly _type: 'Concept';
    tag: string;
    color: string;

    largestThoughts: ThoughtLight[];
}

export interface ConceptLight {
    tag: string;
    color: string;
}