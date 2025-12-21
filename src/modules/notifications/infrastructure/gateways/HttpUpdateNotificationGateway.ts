import { IHttpClient } from "@/modules/httpClient/interfaces";
import { IUpdateNotificationGateway } from "../../core/gateways/iUpdateNotificationGateway";
import { INotification } from "../../core/entities/iNotification";
import { format } from "date-fns";

export const HttpUpdateNotificationGateway = (
  httpClient: IHttpClient
): IUpdateNotificationGateway => {
  const toNotification = (response: any): INotification => {
    return {
      id: response.id,
      title: response.title,
      message: response.message,
      audience: response.audience,
      scheduledAt: response.scheduledAt,
      createdAt: format(response.createdAt, "dd/MM/yyyy HH:mm"),
      createdBy: response.creator.name,
      updatedAt: response.updatedAt ? format(response.updatedAt, "dd/MM/yyyy HH:mm") : undefined,
      updatedBy: response?.modifier?.name,
    };
  };
  return {
    updateNotification: async (id: string, notification: Partial<INotification>) => {
      try {
        const response = await httpClient.patch(`/notifications/${id}`, {
          title: notification.title,
          message: notification.message,
          audience: notification.audience,
          scheduledAt: notification.scheduledAt,
          updatedBy: notification.updatedBy,
          updatedAt: new Date().toISOString().split('T')[0],
        });
        if (!response.status) {
          return Promise.reject(new Error(response.error.message));
        }
        return Promise.resolve(toNotification(response.data));
      } catch (error) {
        return Promise.reject(error);
      }
    },
  };
};

