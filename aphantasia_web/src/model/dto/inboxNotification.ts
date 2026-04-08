import type { ThoughtTitle } from "./thought";
import type { UserColorName } from "./user";

export interface InboxNotification { // that doesn't really notify in any way but what else to call such object?
    id: string;
    recipientId: string;
    read: boolean;
    text?: string;
    thought?: ThoughtTitle;
    fromUser?: UserColorName;
    dateCreated: string;
}