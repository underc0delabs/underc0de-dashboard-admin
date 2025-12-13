import { INotification } from "../entities/iNotification";

export interface IGetNotificationGateway {
  getNotifications(): Promise<INotification[]>;
}

