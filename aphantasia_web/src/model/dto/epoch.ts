import type { ThoughtNode } from "./thought";

export const EpochPseudoId = {
    LATEST_CONTEXT: -2,
    EPOCHLESS: -1,
} as const;

export interface Epoch {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    thoughts: ThoughtNode[];
    previousEpochId: number | null;
    nextEpochId: number | null;
}