import type { ThoughtNode } from "./thought";

export interface Epoch {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    thoughts: ThoughtNode[];
}