import { IHttpClient } from "@/modules/httpClient/interfaces";
import { ICreateNotificationGateway } from "../../core/gateways/iCreateNotificationGateway";
import { INotification } from "../../core/entities/iNotification";
import { format } from "date-fns";

export const HttpCreateNotificationGateway = (
  httpClient: IHttpClient
): ICreateNotificationGateway => {
  const toNotification = (response: any): INotification => {
    return {
      id: response.id,
      title: response.title,
      message: response.message,
      audience: response.audience,
      scheduledAt: response.scheduledAt,
      createdAt: format(response.createdAt, "dd/MM/yyyy HH:mm"),
      createdBy: response?.creator?.name,
      updatedAt: response.updatedAt
        ? format(response.updatedAt, "dd/MM/yyyy HH:mm")
        : undefined,
      updatedBy: response?.modifier?.name,
    };
  };
  return {
    createNotification: async (notification: Partial<INotification>) => {
      try {
        const response = await httpClient.post(`/notifications`, {
          title: notification.title,
          message: notification.message,
          audience: notification.audience,
          scheduledAt: notification.scheduledAt,
          createdBy: notification.createdBy,
          createdAt: new Date().toISOString().split('T')[0],
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

