import { INotification } from "../entities/iNotification";
import { IUpdateNotificationGateway } from "../gateways/iUpdateNotificationGateway";

export interface IUpdateNotificationAction {
  execute(id: string, notification: Partial<INotification>): Promise<INotification>;
}

export const updateNotificationAction = (
  updateNotificationGateway: IUpdateNotificationGateway
): IUpdateNotificationAction => {
  return {
    execute: async (id: string, notification: Partial<INotification>) => {
      return await updateNotificationGateway.updateNotification(id, notification);
    },
  };
};

