import { type InboxNotification } from "../model/dto/inboxNotification";
import { fetchBase, postBase } from "./apiBase";

export const api_fetchNotifications = () =>
     fetchBase<InboxNotification[]>('/notifications', 'authorize');

export const api_MarkNotificationAsRead = (id: string) =>
     postBase(`/notifications/${id}/mark-read`, {}, 'authorize');

export const api_MarkAllNotificationsAsRead = () =>
     postBase(`/notifications/mark-read`, {}, 'authorize');