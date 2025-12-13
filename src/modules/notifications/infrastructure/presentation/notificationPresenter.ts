import { INotification } from "../../core/entities/iNotification";
import { INotificationPresenter } from "../../core/presentation/iNotificationPresenter";
import { IGetNotificationAction } from "../../core/actions/getNotificationAction";
import { ICreateNotificationAction } from "../../core/actions/createNotificationAction";
import { IUpdateNotificationAction } from "../../core/actions/updateNotificationAction";
import { IDeleteNotificationAction } from "../../core/actions/deleteNotificationAction";
import { INotificationViews } from "../../core/views/iNotificationViews";

export const NotificationPresenter = (
  getNotificationAction: IGetNotificationAction,
  createNotificationAction: ICreateNotificationAction,
  updateNotificationAction: IUpdateNotificationAction,
  deleteNotificationAction: IDeleteNotificationAction,
  viewHandlers: INotificationViews
): INotificationPresenter => {
  return {
    getNotifications: async () => {
      getNotificationAction
        .execute()
        .then(viewHandlers.getNotificationsSuccess)
        .catch(viewHandlers.getNotificationsError);
    },
    createNotification: async (notification: Partial<INotification>) => {
      createNotificationAction
        .execute(notification)
        .then(viewHandlers.createNotificationSuccess)
        .catch(viewHandlers.createNotificationError);
    },
    updateNotification: async (id: string, notification: Partial<INotification>) => {
      updateNotificationAction
        .execute(id, notification)
        .then(viewHandlers.updateNotificationSuccess)
        .catch(viewHandlers.updateNotificationError);
    },
    deleteNotification: async (id: string) => {
      deleteNotificationAction
        .execute(id)
        .then(viewHandlers.deleteNotificationSuccess)
        .catch(viewHandlers.deleteNotificationError);
    },
  };
};

