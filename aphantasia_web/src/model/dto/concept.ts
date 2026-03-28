import type { ThoughtLight } from "./thought";

export interface Concept {
    tag: string;
    color: string;

    largestThoughts: ThoughtLight[];
}

export interface ConceptLight {
    tag: string;
    color: string;
}