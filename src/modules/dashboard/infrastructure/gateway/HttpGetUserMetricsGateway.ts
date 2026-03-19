import { IHttpClient } from "@/modules/httpClient/interfaces";
import { IGetUsersMetricsGateway } from "../../core/gateways/IGetUsersMetricsGateway";
import { IMetrics } from "../../core/entities/IMetrics";

export const HttpGetUserMetricsGateway = (
  httpClient: IHttpClient
): IGetUsersMetricsGateway => {
  const toUserMetrics = (response: any): IMetrics => {
    return {
      users: response.users ?? 0,
      merchants: response.merchants ?? 0,
      notifications: response.notifications ?? 0,
      subscriptions: response.subscriptions ?? response.subscriptionsActive ?? 0,
      subscriptionsActive: response.subscriptionsActive ?? 0,
      subscriptionsCancelled: response.subscriptionsCancelled ?? 0,
    };
  };
  return {
    getUsersMetrics: async () => {
      try {
        const response = await httpClient.get("/users/metrics");
        if (!response.status) {
          return Promise.reject(new Error(response.error.message));
        }
        return Promise.resolve(toUserMetrics(response.data));
      } catch (error) {
        return Promise.reject(error);
      }
    },
  };
};
