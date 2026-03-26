import type { ThoughtNode } from "./thought";

export interface Epoch {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    thoughts: ThoughtNode[];
}