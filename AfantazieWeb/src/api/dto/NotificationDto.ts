export interface notificationDto {
    id: number;
    dateCreated: string;
    thoughtTitle: string | undefined;
    thoughtId: number | undefined;
    thoughtAuthor: string | undefined;
    isRead: boolean;
    color: string;
    type: NotificationType;
}

export enum NotificationType {
    NewReply = 0,
    Announcement = 100,
    SystemMessage = 101,
}