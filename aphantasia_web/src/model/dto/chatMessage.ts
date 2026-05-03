export interface ChatMessage {
    id: string;
    authorId: string;
    authorUsername: string;
    authorColor: string;
    content: string;
    createdAt: string;
    parentId: string | null;
    x: number;
    y: number;
}
