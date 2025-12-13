import { INotification } from "../entities/iNotification";

export interface IUpdateNotificationGateway {
  updateNotification(id: string, notification: Partial<INotification>): Promise<INotification>;
}

