import type { ThoughtNode } from "./thought";

export interface Concept {
    tag: string;
    color: string;

    largestThoughts: ThoughtNode[];
}

export interface ConceptLight {
    tag: string;
    color: string;
}