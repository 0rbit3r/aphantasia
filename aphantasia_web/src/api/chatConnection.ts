import { HubConnectionBuilder, type HubConnection } from '@microsoft/signalr';
import type { ChatMessage } from '../model/dto/chatMessage';

let connection: HubConnection | null = null;

export function buildChatConnection(): HubConnection {
    connection = new HubConnectionBuilder()
        .withUrl(import.meta.env.VITE_URL + '/hub/chat', {
            accessTokenFactory: () => localStorage.getItem('authToken') ?? '',
        })
        .withAutomaticReconnect()
        .build();

    return connection;
}

export function getChatConnection(): HubConnection | null {
    return connection;
}

export async function sendChatMessage(content: string, parentId: string | null, x: number, y: number): Promise<void> {
    if (!connection) return;
    await connection.invoke('SendMessage', content, parentId, x, y);
}

export async function stopChatConnection(): Promise<void> {
    if (!connection) return;
    await connection.stop();
    connection = null;
}

export function onInitialMessages(handler: (messages: ChatMessage[]) => void): void {
    connection?.on('InitialMessages', handler);
}

export function onReceiveMessage(handler: (message: ChatMessage) => void): void {
    connection?.on('ReceiveMessage', handler);
}

export async function deleteChatMessage(messageId: string): Promise<void> {
    if (!connection) return;
    await connection.invoke('DeleteMessage', messageId);
}

export function onMessageDeleted(handler: (messageId: string) => void): void {
    connection?.on('MessageDeleted', handler);
}
