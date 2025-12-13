import { INotification } from "../entities/iNotification";

export interface ICreateNotificationGateway {
  createNotification(notification: Partial<INotification>): Promise<INotification>;
}

