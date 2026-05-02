export interface ChatMessage {
    id: string;
    authorUsername: string;
    authorColor: string;
    content: string;
    createdAt: string;
    parentId: string | null;
    x: number;
    y: number;
}
