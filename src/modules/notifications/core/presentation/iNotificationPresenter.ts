import { INotification } from "../entities/iNotification";

export interface INotificationPresenter {
  getNotifications(): void;
  createNotification(notification: Partial<INotification>): void;
  updateNotification(id: string, notification: Partial<INotification>): void;
  deleteNotification(id: string): void;
}

