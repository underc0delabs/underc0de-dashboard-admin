import { IHttpClient } from "@/modules/httpClient/interfaces";
import { IGetUsersMetricsGateway } from "../../core/gateways/IGetUsersMetricsGateway";
import { IUserMetric } from "../../core/entities/IUserMetric";

export const HttpGetUserMetricsGateway = (
  httpClient: IHttpClient
): IGetUsersMetricsGateway => {
  const toUserMetrics = (response: any): IUserMetric => {
    return {
      total: response.total,
      active: response.active,
    };
  };
  return {
    getUsersMetrics: async () => {
      try {
        const response = await httpClient.get("/admin-users/users-metrics");
        return Promise.resolve(toUserMetrics(response.data));
      } catch (error) {
        return Promise.reject(error);
      }
    },
  };
};
