import type { NodeShape } from "grafika";
import type { ThoughtTitle } from "./dto/thought";

export interface ThoughtInMaking {
    readonly _type: 'ThoughtInMaking';
    title: string;
    content: string;
    links: ThoughtTitle[];
    concepts: string[];
    validations: string[];
    shape: NodeShape;
    color: string;

    cursorPosition: number;

    linkSelectionState: 'hidden' | 'link-menu' | 'bookmarks' | 'mine' | 'type-select' | 'quote' | 'custom-text';
} 