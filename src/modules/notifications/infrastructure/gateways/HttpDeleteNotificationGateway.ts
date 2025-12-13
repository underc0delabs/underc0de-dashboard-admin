import { IHttpClient } from "@/modules/httpClient/interfaces";
import { IDeleteNotificationGateway } from "../../core/gateways/iDeleteNotificationGateway";

export const HttpDeleteNotificationGateway = (
  httpClient: IHttpClient
): IDeleteNotificationGateway => {
  return {
    deleteNotification: async (id: string) => {
      try {
        const response = await httpClient.delete(`/notifications/${id}`);
        if (!response.status) {
          return Promise.reject(new Error(response.error.message));
        }
        return Promise.resolve(true);
      } catch (error) {
        return Promise.reject(error);
      }
    },
  };
};

