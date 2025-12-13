import { INotification } from "../entities/iNotification";

export interface INotificationViews {
  getNotificationsSuccess(notifications: INotification[]): void;
  getNotificationsError(error: Error): void;
  createNotificationSuccess(notification: INotification): void;
  createNotificationError(error: Error): void;
  updateNotificationSuccess(notification: INotification): void;
  updateNotificationError(error: Error): void;
  deleteNotificationSuccess(): void;
  deleteNotificationError(error: Error): void;
}

