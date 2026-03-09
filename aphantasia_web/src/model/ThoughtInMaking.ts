import type { NodeShape } from "../../../../grafika/dist/api/dataTypes";

export interface ThoughtInMaking {
    readonly _type: 'ThoughtInMaking';
    title: string;
    content: string;    
    links: string[];
    concepts: string[];
    validations: string[];
    shape: NodeShape;
}