import { INotification } from "../entities/iNotification";
import { IGetNotificationGateway } from "../gateways/iGetNotificationGateway";

export interface IGetNotificationAction {
  execute(): Promise<INotification[]>;
}

export const getNotificationAction = (
  getNotificationGateway: IGetNotificationGateway
): IGetNotificationAction => {
  return {
    execute: async () => {
      try {
        return await getNotificationGateway.getNotifications();
      } catch (error) {
        return Promise.reject(error);
      }
    },
  };
};

