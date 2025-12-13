import { IDeleteNotificationGateway } from "../gateways/iDeleteNotificationGateway";

export interface IDeleteNotificationAction {
  execute(id: string): Promise<boolean>;
}

export const deleteNotificationAction = (
  deleteNotificationGateway: IDeleteNotificationGateway
): IDeleteNotificationAction => {
  return {
    execute: async (id: string) => {
      return await deleteNotificationGateway.deleteNotification(id);
    },
  };
};

