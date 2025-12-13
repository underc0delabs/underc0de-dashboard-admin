import { INotification } from "../entities/iNotification";
import { ICreateNotificationGateway } from "../gateways/iCreateNotificationGateway";

export interface ICreateNotificationAction {
  execute(notification: Partial<INotification>): Promise<INotification>;
}

export const createNotificationAction = (
  createNotificationGateway: ICreateNotificationGateway
): ICreateNotificationAction => {
  return {
    execute: async (notification: Partial<INotification>) => {
      return await createNotificationGateway.createNotification(notification);
    },
  };
};

