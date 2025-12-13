import { IHttpClient } from "@/modules/httpClient/interfaces";
import { IGetNotificationGateway } from "../../core/gateways/iGetNotificationGateway";
import { INotification } from "../../core/entities/iNotification";
import { format } from "date-fns";

export const HttpGetNotificationGateway = (
  httpClient: IHttpClient
): IGetNotificationGateway => {
  const toNotifications = (response: any): INotification[] => {
    console.log("response get notifications", response);
    return response.map((notification: any) => ({
      id: notification.id,
      title: notification.title,
      message: notification.message,
      audience: notification.audience,
      createdAt: format(notification.createdAt, "dd/MM/yyyy HH:mm"),
      createdBy: notification.creator.name,
      updatedAt: notification.updatedAt
        ? format(notification.updatedAt, "dd/MM/yyyy HH:mm")
        : undefined,
      updatedBy: notification?.modifier?.name,
    }));
  };
  return {
    getNotifications: async () => {
      try {
        const response = await httpClient.get("/notifications");
        if (!response.status) {
          return Promise.reject(new Error(response.error.message));
        }
        return Promise.resolve(toNotifications(response.data));
      } catch (error) {
        return Promise.reject(error);
      }
    },
  };
};
